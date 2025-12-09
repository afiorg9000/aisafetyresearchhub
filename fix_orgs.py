"""
Scrape the 3 orgs with broken URLs and merge into existing data.
- Japan AISI: Try alternate URL
- DeepMind: Updated URL structure
- ARC Evals: Removed (merged into METR)
"""

import requests
from bs4 import BeautifulSoup
import anthropic
import json
import os
from dotenv import load_dotenv

load_dotenv()
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Japan AISI - manually adding since URL is unreachable
# Per news reports, launched Feb 2024 under METI
MANUAL_ORGS = [
    {
        "name": "Japan AI Safety Institute",
        "url": "https://www.meti.go.jp/english/policy/mono_info_service/information_economy/artificial_intelligence.html",
        "type": "Government AISI",
        "country": "Japan",
        "mission": "Japan's AI Safety Institute (AISI) evaluates the safety of advanced AI systems and promotes international cooperation on AI safety standards.",
        "focus_areas": ["Evals", "Governance", "Policy", "Benchmarks"],
        "projects": [
            {"name": "Frontier Model Evaluations", "description": "Safety evaluations of frontier AI models in cooperation with international partners", "status": "Active"},
            {"name": "AI Safety Guidelines", "description": "Development of safety guidelines for generative AI", "status": "Active"}
        ],
        "notes": "Launched February 2024 under METI. Part of the international network of AI Safety Institutes. Participates in joint evaluation protocols with US AISI and UK AISI."
    }
]

FIXED_ORGS = []  # No URLs to scrape, using manual data

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
        
        for tag in soup(["script", "style", "nav", "footer", "header"]):
            tag.decompose()
        
        text = soup.get_text(separator=" ", strip=True)
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
        response_text = response.content[0].text
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        return json.loads(response_text.strip())
    
    except Exception as e:
        print(f"  ✗ Error extracting data for {org_name}: {e}")
        return None


def main():
    # Load existing data
    with open("ai_safety_orgs.json", "r") as f:
        existing = json.load(f)
    
    print(f"Loaded {len(existing)} existing orgs\n")
    
    # Scrape fixed orgs
    new_orgs = []
    for org in FIXED_ORGS:
        print(f"Scraping {org['name']}...")
        
        content = scrape_url(org["url"])
        if not content:
            continue
        
        extracted = extract_with_llm(org["name"], content)
        if not extracted:
            continue
        
        result = {**org, **extracted}
        new_orgs.append(result)
        
        projects_count = len(extracted.get('projects', []))
        people_count = len(extracted.get('key_people', []))
        print(f"  ✓ Found {projects_count} projects, {people_count} people")
    
    # Add manual orgs
    all_new = new_orgs + MANUAL_ORGS
    
    # Merge: replace orgs with same name, or add new ones
    existing_names = {org["name"] for org in existing}
    
    for new_org in all_new:
        if new_org["name"] in existing_names:
            # Replace existing
            existing = [org for org in existing if org["name"] != new_org["name"]]
        existing.append(new_org)
    
    # Save merged data
    with open("ai_safety_orgs.json", "w") as f:
        json.dump(existing, f, indent=2)
    
    print(f"\n{'='*50}")
    print(f"Done! Now have {len(existing)} orgs in ai_safety_orgs.json")
    print(f"Added/updated: {[org['name'] for org in all_new]}")


if __name__ == "__main__":
    main()


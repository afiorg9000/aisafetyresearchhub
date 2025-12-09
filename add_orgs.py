"""
Add more AI safety orgs to the dataset.
"""

import requests
from bs4 import BeautifulSoup
import anthropic
import json
import os
from dotenv import load_dotenv

load_dotenv()
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# New orgs to scrape - ones with research papers
NEW_ORGS = [
    {"name": "MATS", "url": "https://www.matsprogram.org/", "type": "Nonprofit", "country": "United States"},
    {"name": "Conjecture", "url": "https://www.conjecture.dev/research", "type": "Lab Safety Team", "country": "United Kingdom"},
    {"name": "FAR AI", "url": "https://far.ai/", "type": "Nonprofit", "country": "United States"},
    {"name": "Epoch AI", "url": "https://epoch.ai/research", "type": "Nonprofit", "country": "United States"},
    {"name": "Apart Research", "url": "https://apartresearch.com/", "type": "Nonprofit", "country": "Denmark"},
    {"name": "EleutherAI", "url": "https://www.eleuther.ai/", "type": "Nonprofit", "country": "United States"},
    {"name": "Future of Life Institute", "url": "https://futureoflife.org/", "type": "Nonprofit", "country": "United States"},
    {"name": "Alignment Forum", "url": "https://www.alignmentforum.org/", "type": "Nonprofit", "country": "United States"},
    {"name": "AI Safety Camp", "url": "https://aisafety.camp/", "type": "Nonprofit", "country": "International"},
    {"name": "Ought / Elicit", "url": "https://elicit.com/", "type": "Nonprofit", "country": "United States"},
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
    
    existing_names = {org["name"] for org in existing}
    print(f"Loaded {len(existing)} existing orgs\n")
    
    # Scrape new orgs
    new_orgs = []
    for org in NEW_ORGS:
        if org["name"] in existing_names:
            print(f"Skipping {org['name']} (already exists)")
            continue
            
        print(f"Scraping {org['name']}...")
        
        content = scrape_url(org["url"])
        if not content:
            continue
        
        extracted = extract_with_llm(org["name"], content)
        if not extracted:
            continue
        
        result = {**org, **extracted}
        new_orgs.append(result)
        existing.append(result)
        
        projects_count = len(extracted.get('projects', []))
        people_count = len(extracted.get('key_people', []))
        print(f"  ✓ Found {projects_count} projects, {people_count} people")
    
    # Save updated data
    with open("ai_safety_orgs.json", "w") as f:
        json.dump(existing, f, indent=2)
    
    print(f"\n{'='*50}")
    print(f"Done! Now have {len(existing)} orgs in ai_safety_orgs.json")
    print(f"Added: {[org['name'] for org in new_orgs]}")


if __name__ == "__main__":
    main()


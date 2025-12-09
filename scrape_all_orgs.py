"""
Comprehensive scraper for AI safety organizations.
Extracts research projects, publications, and benchmarks from each org.
"""

import json
import time
import re
import os
import requests
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
from anthropic import Anthropic
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Anthropic client with API key from env
api_key = os.getenv("ANTHROPIC_API_KEY")
if not api_key:
    raise ValueError("ANTHROPIC_API_KEY not found in environment")
client = Anthropic(api_key=api_key)

# Organization URLs for research/projects pages
ORGS_TO_SCRAPE = {
    "US AI Safety Institute": {
        "urls": [
            "https://www.nist.gov/aisi",
            "https://www.nist.gov/artificial-intelligence/executive-order-safe-secure-and-trustworthy-artificial-intelligence"
        ],
        "type": "Government AISI"
    },
    "UK AI Safety Institute": {
        "urls": [
            "https://www.aisi.gov.uk/work",
            "https://www.aisi.gov.uk/research"
        ],
        "type": "Government AISI"
    },
    "EU AI Office": {
        "urls": [
            "https://digital-strategy.ec.europa.eu/en/policies/ai-office"
        ],
        "type": "Government AISI"
    },
    "Japan AI Safety Institute": {
        "urls": [
            "https://aisi.go.jp/en/"
        ],
        "type": "Government AISI"
    },
    "Anthropic": {
        "urls": [
            "https://www.anthropic.com/research",
            "https://www.anthropic.com/news"
        ],
        "type": "Lab Safety Team"
    },
    "OpenAI Safety": {
        "urls": [
            "https://openai.com/safety",
            "https://openai.com/research"
        ],
        "type": "Lab Safety Team"
    },
    "Google DeepMind Safety": {
        "urls": [
            "https://deepmind.google/discover/blog/",
            "https://deepmind.google/research/"
        ],
        "type": "Lab Safety Team"
    },
    "Conjecture": {
        "urls": [
            "https://www.conjecture.dev/research"
        ],
        "type": "Lab Safety Team"
    },
    "MIRI": {
        "urls": [
            "https://intelligence.org/research/",
            "https://intelligence.org/blog/"
        ],
        "type": "Nonprofit"
    },
    "Redwood Research": {
        "urls": [
            "https://www.redwoodresearch.org/research"
        ],
        "type": "Nonprofit"
    },
    "ARC (Alignment Research Center)": {
        "urls": [
            "https://www.alignment.org/"
        ],
        "type": "Nonprofit"
    },
    "Apollo Research": {
        "urls": [
            "https://www.apolloresearch.ai/research",
            "https://www.apolloresearch.ai/blog"
        ],
        "type": "Nonprofit"
    },
    "METR": {
        "urls": [
            "https://metr.org/research",
            "https://metr.org/blog"
        ],
        "type": "Nonprofit"
    },
    "Center for AI Safety": {
        "urls": [
            "https://www.safe.ai/research",
            "https://www.safe.ai/work"
        ],
        "type": "Nonprofit"
    },
    "Center on Long-Term Risk": {
        "urls": [
            "https://longtermrisk.org/research/"
        ],
        "type": "Nonprofit"
    },
    "MATS": {
        "urls": [
            "https://www.matsprogram.org/research"
        ],
        "type": "Nonprofit"
    },
    "FAR AI": {
        "urls": [
            "https://far.ai/publication/",
            "https://far.ai/research/"
        ],
        "type": "Nonprofit"
    },
    "Epoch AI": {
        "urls": [
            "https://epoch.ai/research",
            "https://epoch.ai/blog"
        ],
        "type": "Nonprofit"
    },
    "Apart Research": {
        "urls": [
            "https://apartresearch.com/research"
        ],
        "type": "Nonprofit"
    },
    "EleutherAI": {
        "urls": [
            "https://www.eleuther.ai/research",
            "https://blog.eleuther.ai/"
        ],
        "type": "Nonprofit"
    },
    "Future of Life Institute": {
        "urls": [
            "https://futureoflife.org/project/",
            "https://futureoflife.org/cause-area/artificial-intelligence/"
        ],
        "type": "Nonprofit"
    },
    "AI Safety Camp": {
        "urls": [
            "https://aisafety.camp/projects/"
        ],
        "type": "Nonprofit"
    },
    "Ought / Elicit": {
        "urls": [
            "https://elicit.com/",
            "https://ought.org/research"
        ],
        "type": "Nonprofit"
    },
    "CSET Georgetown": {
        "urls": [
            "https://cset.georgetown.edu/publications/",
            "https://cset.georgetown.edu/research/"
        ],
        "type": "Think Tank"
    },
    "GovAI Oxford": {
        "urls": [
            "https://www.governance.ai/research",
            "https://www.governance.ai/research-paper"
        ],
        "type": "Think Tank"
    },
    "CHAI Berkeley": {
        "urls": [
            "https://humancompatible.ai/research",
            "https://humancompatible.ai/publications"
        ],
        "type": "Academic"
    },
}


def fetch_page_content(url, use_playwright=False):
    """Fetch page content, optionally using Playwright for JS-rendered pages."""
    try:
        if use_playwright:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                page.goto(url, timeout=30000)
                time.sleep(2)  # Wait for JS
                content = page.content()
                browser.close()
                return content
        else:
            response = requests.get(
                url, 
                headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"},
                timeout=30
            )
            return response.text
    except Exception as e:
        print(f"    Error fetching {url}: {e}")
        return None


def extract_with_llm(org_name, content, org_type):
    """Use Claude to extract structured research data from page content."""
    
    # Truncate content if too long
    if len(content) > 50000:
        content = content[:50000]
    
    prompt = f"""Extract research projects, publications, and benchmarks from this {org_type} organization's webpage content.

Organization: {org_name}

Return a JSON object with this exact structure:
{{
    "projects": [
        {{
            "name": "Project name",
            "description": "Brief description",
            "status": "Active" or "Completed" or "published",
            "paper_url": "URL if available, otherwise empty string"
        }}
    ],
    "benchmarks": [
        {{
            "name": "Benchmark name",
            "measures": "What it measures",
            "status": "Active"
        }}
    ],
    "key_people": [
        {{
            "name": "Person name",
            "role": "Their role"
        }}
    ]
}}

Only include items you can clearly identify from the content. If you can't find any items for a category, return an empty array.
Focus on AI safety research, evaluations, alignment work, and safety benchmarks.

Webpage content:
{content}

Return ONLY the JSON object, no other text."""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4000,
            messages=[{"role": "user", "content": prompt}]
        )
        
        result_text = response.content[0].text.strip()
        
        # Clean up response
        if result_text.startswith("```"):
            result_text = re.sub(r'^```json?\n?', '', result_text)
            result_text = re.sub(r'\n?```$', '', result_text)
        
        return json.loads(result_text)
    except Exception as e:
        print(f"    LLM extraction error: {e}")
        return {"projects": [], "benchmarks": [], "key_people": []}


def scrape_org(org_name, config):
    """Scrape a single organization."""
    print(f"\n{'='*60}")
    print(f"Scraping: {org_name}")
    print(f"{'='*60}")
    
    all_projects = []
    all_benchmarks = []
    all_people = []
    
    for url in config["urls"]:
        print(f"  → {url}")
        
        # Try regular fetch first, then Playwright
        content = fetch_page_content(url, use_playwright=False)
        if not content or len(content) < 1000:
            print(f"    Trying Playwright...")
            content = fetch_page_content(url, use_playwright=True)
        
        if not content:
            print(f"    Failed to fetch content")
            continue
        
        # Parse with BeautifulSoup to get text
        soup = BeautifulSoup(content, "html.parser")
        
        # Remove script and style elements
        for element in soup(["script", "style", "nav", "footer", "header"]):
            element.decompose()
        
        text_content = soup.get_text(separator="\n", strip=True)
        
        if len(text_content) < 200:
            print(f"    Not enough content ({len(text_content)} chars)")
            continue
        
        print(f"    Got {len(text_content)} chars, extracting with LLM...")
        
        # Extract with LLM
        extracted = extract_with_llm(org_name, text_content, config["type"])
        
        if extracted.get("projects"):
            print(f"    Found {len(extracted['projects'])} projects")
            all_projects.extend(extracted["projects"])
        
        if extracted.get("benchmarks"):
            print(f"    Found {len(extracted['benchmarks'])} benchmarks")
            all_benchmarks.extend(extracted["benchmarks"])
        
        if extracted.get("key_people"):
            print(f"    Found {len(extracted['key_people'])} people")
            all_people.extend(extracted["key_people"])
        
        # Rate limit
        time.sleep(1)
    
    # Deduplicate
    seen_projects = set()
    unique_projects = []
    for p in all_projects:
        key = p["name"].lower()
        if key not in seen_projects:
            unique_projects.append(p)
            seen_projects.add(key)
    
    seen_benchmarks = set()
    unique_benchmarks = []
    for b in all_benchmarks:
        key = b["name"].lower()
        if key not in seen_benchmarks:
            unique_benchmarks.append(b)
            seen_benchmarks.add(key)
    
    seen_people = set()
    unique_people = []
    for p in all_people:
        key = p["name"].lower()
        if key not in seen_people:
            unique_people.append(p)
            seen_people.add(key)
    
    return {
        "projects": unique_projects,
        "benchmarks": unique_benchmarks,
        "key_people": unique_people
    }


def main():
    print("=" * 60)
    print("COMPREHENSIVE AI SAFETY ORG SCRAPER")
    print("=" * 60)
    print(f"Scraping {len(ORGS_TO_SCRAPE)} organizations...")
    
    # Load existing data
    with open("ai_safety_orgs.json", "r") as f:
        existing_orgs = json.load(f)
    
    # Create lookup
    org_lookup = {org["name"]: org for org in existing_orgs}
    
    # Track stats
    total_new_projects = 0
    total_new_benchmarks = 0
    total_new_people = 0
    
    # Scrape each org
    for org_name, config in ORGS_TO_SCRAPE.items():
        try:
            result = scrape_org(org_name, config)
            
            if org_name in org_lookup:
                org = org_lookup[org_name]
                
                # Add new projects
                existing_project_names = {p["name"].lower() for p in org.get("projects", [])}
                for project in result["projects"]:
                    if project["name"].lower() not in existing_project_names:
                        if "projects" not in org:
                            org["projects"] = []
                        org["projects"].append(project)
                        total_new_projects += 1
                
                # Add new benchmarks
                existing_benchmark_names = {b["name"].lower() for b in org.get("benchmarks", [])}
                for benchmark in result["benchmarks"]:
                    if benchmark["name"].lower() not in existing_benchmark_names:
                        if "benchmarks" not in org:
                            org["benchmarks"] = []
                        org["benchmarks"].append(benchmark)
                        total_new_benchmarks += 1
                
                # Add new people
                existing_people_names = {p["name"].lower() for p in org.get("key_people", [])}
                for person in result["key_people"]:
                    if person["name"].lower() not in existing_people_names:
                        if "key_people" not in org:
                            org["key_people"] = []
                        org["key_people"].append(person)
                        total_new_people += 1
            
            print(f"  ✓ {org_name}: +{len(result['projects'])} projects, +{len(result['benchmarks'])} benchmarks, +{len(result['key_people'])} people")
            
        except Exception as e:
            print(f"  ✗ Error scraping {org_name}: {e}")
        
        # Rate limit between orgs
        time.sleep(1)
    
    # Save updated data
    with open("ai_safety_orgs.json", "w") as f:
        json.dump(existing_orgs, f, indent=2)
    
    print("\n" + "=" * 60)
    print("SCRAPING COMPLETE")
    print("=" * 60)
    print(f"New projects added: {total_new_projects}")
    print(f"New benchmarks added: {total_new_benchmarks}")
    print(f"New people added: {total_new_people}")
    print("\nSaved to ai_safety_orgs.json")


if __name__ == "__main__":
    main()


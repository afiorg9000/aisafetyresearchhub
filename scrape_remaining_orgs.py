"""
Look up URLs for orgs without them and scrape their research/benchmarks.
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

load_dotenv()
client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Known URLs for the remaining orgs (researched manually)
ORG_URLS = {
    # Major orgs (20+ staff)
    "RAND TASP": ["https://www.rand.org/topics/technology-and-security-policy.html"],
    "CSET": ["https://cset.georgetown.edu/"],  # Already have CSET Georgetown
    "80,000 Hours": ["https://80000hours.org/articles/", "https://80000hours.org/problem-profiles/artificial-intelligence/"],
    "Lakera": ["https://www.lakera.ai/blog", "https://www.lakera.ai/"],
    "AISLE": ["https://www.aisle.ai/"],
    "Partnership on AI": ["https://partnershiponai.org/research/", "https://partnershiponai.org/workstreams/"],
    "Longview": ["https://www.longview.org/"],
    "Virtue AI": ["https://virtue.ai/"],
    "Palisade Research": ["https://palisaderesearch.org/"],
    "Goodfire": ["https://www.goodfire.ai/blog", "https://www.goodfire.ai/research"],
    "CSER": ["https://www.cser.ac.uk/research/", "https://www.cser.ac.uk/research/ai-safety/"],
    "Gray Swan AI": ["https://grayswan.ai/research"],
    "Constellation": ["https://www.constellation.org/"],
    "The Future Society": ["https://thefuturesociety.org/research/", "https://thefuturesociety.org/projects/"],
    "CLTC": ["https://cltc.berkeley.edu/research/"],
    "IAPS": ["https://iaps.ai/research/"],
    "Dreadnode": ["https://dreadnode.io/"],
    "Transluce": ["https://transluce.org/"],
    "AI Now Institute": ["https://ainowinstitute.org/research", "https://ainowinstitute.org/publication"],
    "Global Center on AI Governance": ["https://www.carnegiecouncil.org/programs/artificial-intelligence"],
    "Timaeus": ["https://www.timaeus.co/research", "https://www.timaeus.co/blog"],
    "CLTR": ["https://longtermresilience.org/research/"],
    
    # Medium orgs (10-19 staff)
    "LawAI": ["https://www.law.ai/"],
    "Iliad": ["https://www.iliadsciences.com/"],
    "LawZero": ["https://www.lawzero.ai/"],
    "CeSIA": ["https://cesia.eu/research/"],
    "AOI": ["https://www.ai-objectives.org/"],
    "Concordia AI": ["https://www.concordia.ai/"],
    "HAIST": ["https://haist.ai/"],
    "BAIF": ["https://bai-futures.org/"],
    "SaferAI": ["https://www.safer-ai.org/research"],
    "CARMA": ["https://www.carma-ai.org/"],
    "Horizon Institute": ["https://www.horizoninstitute.org/"],
    "Atla AI": ["https://www.atla.ai/research"],
    "CIP": ["https://www.aipolicy.org/research"],
    
    # Smaller but important orgs
    "Fathom": ["https://fathom.io/"],
    "Leap Labs": ["https://www.leap-labs.com/"],
    "ERA": ["https://existentialriskalliance.org/"],
    "BlueDot Impact": ["https://bluedot.org/"],
    "ARENA": ["https://www.arena.education/"],
    "Haize Labs": ["https://www.haizelabs.com/"],
    "PRISM Eval": ["https://prism-eval.ai/"],
    "PIBBSS": ["https://www.pibbss.ai/", "https://www.pibbss.ai/research"],
    "AI Impacts": ["https://aiimpacts.org/"],
    "Aligned AI": ["https://www.aligned.ai/"],
    "Orthogonal": ["https://www.orthogonal.io/"],
}


def fetch_page_content(url, use_playwright=False):
    """Fetch page content."""
    try:
        if use_playwright:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                page.goto(url, timeout=30000)
                time.sleep(2)
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


def extract_with_llm(org_name, content):
    """Use Claude to extract structured research data."""
    if len(content) > 50000:
        content = content[:50000]
    
    prompt = f"""Extract research projects, publications, and benchmarks from this AI safety organization's webpage.

Organization: {org_name}

Return a JSON object:
{{
    "projects": [
        {{"name": "Project name", "description": "Brief description", "status": "Active" or "Completed" or "published", "paper_url": ""}}
    ],
    "benchmarks": [
        {{"name": "Benchmark name", "measures": "What it measures", "status": "Active"}}
    ],
    "key_people": [
        {{"name": "Person name", "role": "Their role"}}
    ]
}}

Focus on AI safety research, evaluations, alignment work. Return ONLY JSON.

Content:
{content}"""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4000,
            messages=[{"role": "user", "content": prompt}]
        )
        result_text = response.content[0].text.strip()
        if result_text.startswith("```"):
            result_text = re.sub(r'^```json?\n?', '', result_text)
            result_text = re.sub(r'\n?```$', '', result_text)
        return json.loads(result_text)
    except Exception as e:
        print(f"    LLM error: {e}")
        return {"projects": [], "benchmarks": [], "key_people": []}


def scrape_org(org_name, urls):
    """Scrape a single organization."""
    print(f"\n{'='*50}")
    print(f"Scraping: {org_name}")
    print(f"{'='*50}")
    
    all_projects = []
    all_benchmarks = []
    all_people = []
    primary_url = urls[0] if urls else ""
    
    for url in urls:
        print(f"  → {url}")
        
        content = fetch_page_content(url, use_playwright=False)
        if not content or len(content) < 500:
            print(f"    Trying Playwright...")
            content = fetch_page_content(url, use_playwright=True)
        
        if not content:
            continue
        
        soup = BeautifulSoup(content, "html.parser")
        for element in soup(["script", "style", "nav", "footer", "header"]):
            element.decompose()
        text_content = soup.get_text(separator="\n", strip=True)
        
        if len(text_content) < 200:
            print(f"    Not enough content")
            continue
        
        print(f"    Got {len(text_content)} chars, extracting...")
        
        extracted = extract_with_llm(org_name, text_content)
        
        if extracted.get("projects"):
            print(f"    Found {len(extracted['projects'])} projects")
            all_projects.extend(extracted["projects"])
        if extracted.get("benchmarks"):
            print(f"    Found {len(extracted['benchmarks'])} benchmarks")
            all_benchmarks.extend(extracted["benchmarks"])
        if extracted.get("key_people"):
            print(f"    Found {len(extracted['key_people'])} people")
            all_people.extend(extracted["key_people"])
        
        time.sleep(1)
    
    # Deduplicate
    seen = set()
    unique_projects = [p for p in all_projects if p["name"].lower() not in seen and not seen.add(p["name"].lower())]
    seen = set()
    unique_benchmarks = [b for b in all_benchmarks if b["name"].lower() not in seen and not seen.add(b["name"].lower())]
    seen = set()
    unique_people = [p for p in all_people if p["name"].lower() not in seen and not seen.add(p["name"].lower())]
    
    return {
        "url": primary_url,
        "projects": unique_projects,
        "benchmarks": unique_benchmarks,
        "key_people": unique_people
    }


def main():
    print("=" * 60)
    print("SCRAPING REMAINING ORGS")
    print("=" * 60)
    
    with open("ai_safety_orgs.json", "r") as f:
        existing_orgs = json.load(f)
    
    org_lookup = {org["name"]: org for org in existing_orgs}
    
    total_new_projects = 0
    total_new_benchmarks = 0
    total_new_people = 0
    urls_added = 0
    
    for org_name, urls in ORG_URLS.items():
        if org_name not in org_lookup:
            print(f"  ⚠ {org_name} not in database, skipping")
            continue
        
        try:
            result = scrape_org(org_name, urls)
            org = org_lookup[org_name]
            
            # Update URL if missing
            if not org.get("url") and result["url"]:
                org["url"] = result["url"]
                urls_added += 1
            
            # Add new projects
            existing_names = {p["name"].lower() for p in org.get("projects", [])}
            for project in result["projects"]:
                if project["name"].lower() not in existing_names:
                    if "projects" not in org:
                        org["projects"] = []
                    org["projects"].append(project)
                    total_new_projects += 1
            
            # Add new benchmarks
            existing_names = {b["name"].lower() for b in org.get("benchmarks", [])}
            for benchmark in result["benchmarks"]:
                if benchmark["name"].lower() not in existing_names:
                    if "benchmarks" not in org:
                        org["benchmarks"] = []
                    org["benchmarks"].append(benchmark)
                    total_new_benchmarks += 1
            
            # Add new people
            existing_names = {p["name"].lower() for p in org.get("key_people", [])}
            for person in result["key_people"]:
                if person["name"].lower() not in existing_names:
                    if "key_people" not in org:
                        org["key_people"] = []
                    org["key_people"].append(person)
                    total_new_people += 1
            
            print(f"  ✓ {org_name}")
            
        except Exception as e:
            print(f"  ✗ Error: {e}")
        
        time.sleep(1)
    
    with open("ai_safety_orgs.json", "w") as f:
        json.dump(existing_orgs, f, indent=2)
    
    print("\n" + "=" * 60)
    print("COMPLETE")
    print("=" * 60)
    print(f"URLs added: {urls_added}")
    print(f"New projects: {total_new_projects}")
    print(f"New benchmarks: {total_new_benchmarks}")
    print(f"New people: {total_new_people}")


if __name__ == "__main__":
    main()


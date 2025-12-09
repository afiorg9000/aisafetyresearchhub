"""
Scrape 13 research-focused organizations and their publications.
"""

import json
import requests
from bs4 import BeautifulSoup
import time
import os
from dotenv import load_dotenv
from anthropic import Anthropic

load_dotenv()

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Organizations to scrape with their research pages
RESEARCH_ORGS = [
    {
        "name": "Center for Human-Compatible AI",
        "url": "https://humancompatible.ai/",
        "research_url": "https://humancompatible.ai/publications",
        "type": "Academic",
        "country": "USA",
        "focus_areas": ["Alignment", "Control", "Cooperative AI"]
    },
    {
        "name": "FAR.AI",
        "url": "https://far.ai/",
        "research_url": "https://far.ai/research/",
        "type": "Nonprofit",
        "country": "USA",
        "focus_areas": ["Evals", "Red-teaming", "Alignment"]
    },
    {
        "name": "MIT Algorithmic Alignment Group",
        "url": "https://algorithmicalignment.csail.mit.edu/",
        "research_url": "https://algorithmicalignment.csail.mit.edu/",
        "type": "Academic",
        "country": "USA",
        "focus_areas": ["Alignment", "Control", "Governance"]
    },
    {
        "name": "NYU Alignment Research Group",
        "url": "https://wp.nyu.edu/arg/",
        "research_url": "https://wp.nyu.edu/arg/publications/",
        "type": "Academic",
        "country": "USA",
        "focus_areas": ["Alignment", "Evals", "Interpretability"]
    },
    {
        "name": "Rethink Priorities",
        "url": "https://rethinkpriorities.org/",
        "research_url": "https://rethinkpriorities.org/publications",
        "type": "Nonprofit",
        "country": "USA",
        "focus_areas": ["Governance", "Policy", "Evals"]
    },
    {
        "name": "Centre for the Study of Existential Risk",
        "url": "https://www.cser.ac.uk/",
        "research_url": "https://www.cser.ac.uk/research/publications/",
        "type": "Academic",
        "country": "UK",
        "focus_areas": ["Governance", "Policy", "Alignment"]
    },
    {
        "name": "Quantified Uncertainty Research Institute",
        "url": "https://quantifieduncertainty.org/",
        "research_url": "https://quantifieduncertainty.org/research",
        "type": "Nonprofit",
        "country": "USA",
        "focus_areas": ["Forecasting", "Evals"]
    },
    {
        "name": "Forecasting Research Institute",
        "url": "https://forecastingresearch.org/",
        "research_url": "https://forecastingresearch.org/research",
        "type": "Nonprofit",
        "country": "USA",
        "focus_areas": ["Forecasting", "Evals"]
    },
    {
        "name": "Institute for AI Policy and Strategy",
        "url": "https://www.iaps.ai/",
        "research_url": "https://www.iaps.ai/research",
        "type": "Nonprofit",
        "country": "USA",
        "focus_areas": ["Policy", "Governance"]
    },
    {
        "name": "Simon Institute for Longterm Governance",
        "url": "https://www.simoninstitute.ch/",
        "research_url": "https://www.simoninstitute.ch/research/",
        "type": "Nonprofit",
        "country": "Switzerland",
        "focus_areas": ["Governance", "Policy"]
    },
    {
        "name": "Apart Research",
        "url": "https://www.apartresearch.com/",
        "research_url": "https://www.apartresearch.com/research",
        "type": "Nonprofit",
        "country": "International",
        "focus_areas": ["Alignment", "Interpretability", "Evals"]
    },
    {
        "name": "Safe Superintelligence Inc.",
        "url": "https://ssi.inc/",
        "research_url": "https://ssi.inc/",
        "type": "Lab Safety Team",
        "country": "USA",
        "focus_areas": ["Alignment", "Control"]
    },
    {
        "name": "TruthfulAI",
        "url": "https://www.truthful.ai/",
        "research_url": "https://www.truthful.ai/",
        "type": "Nonprofit",
        "country": "UK",
        "focus_areas": ["Alignment", "Evals"]
    },
]


def fetch_page(url):
    """Fetch page content"""
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    }
    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"  Error fetching {url}: {e}")
        return None


def extract_publications_with_llm(html_content, org_name):
    """Use Claude to extract publications from HTML"""
    if not html_content:
        return []
    
    # Limit content size
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Remove scripts and styles
    for tag in soup(['script', 'style', 'nav', 'footer', 'header']):
        tag.decompose()
    
    text = soup.get_text(separator='\n', strip=True)[:15000]
    
    prompt = f"""Extract ONLY PUBLISHED research papers/publications from this page for {org_name}.

Return a JSON array of publications. Each publication should have:
- "name": paper title
- "description": brief description or abstract (1-2 sentences max)
- "url": link to paper if available
- "status": "published"
- "authors": list of author names if visible

Only include actual published papers/reports. Skip:
- Blog posts or news articles
- Team bios
- Event announcements
- Job postings

If no publications found, return empty array: []

Page content:
{text}

Return ONLY valid JSON array, no other text."""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4000,
            messages=[{"role": "user", "content": prompt}]
        )
        
        result = response.content[0].text.strip()
        
        # Clean up JSON
        if result.startswith("```"):
            result = result.split("```")[1]
            if result.startswith("json"):
                result = result[4:]
        result = result.strip()
        
        publications = json.loads(result)
        return publications if isinstance(publications, list) else []
        
    except Exception as e:
        print(f"  LLM error: {e}")
        return []


def scrape_research_orgs():
    """Main scraping function"""
    print("=" * 60)
    print("SCRAPING RESEARCH-FOCUSED ORGANIZATIONS")
    print("=" * 60)
    
    # Load existing data
    try:
        with open("ai_safety_orgs.json", "r") as f:
            orgs_data = json.load(f)
    except FileNotFoundError:
        orgs_data = []
    
    existing_names = {org.get("name", "").lower() for org in orgs_data}
    
    new_orgs = 0
    new_publications = 0
    
    for org_info in RESEARCH_ORGS:
        name = org_info["name"]
        print(f"\n📚 {name}")
        
        # Check if org exists
        org_exists = name.lower() in existing_names
        
        if org_exists:
            print(f"  ✓ Org exists, checking for new publications...")
            # Find the existing org
            for org in orgs_data:
                if org.get("name", "").lower() == name.lower():
                    existing_org = org
                    break
        else:
            print(f"  + Adding new organization...")
            existing_org = {
                "name": name,
                "url": org_info["url"],
                "type": org_info["type"],
                "country": org_info["country"],
                "mission": "",
                "focus_areas": org_info["focus_areas"],
                "projects": [],
                "benchmarks": [],
                "key_people": []
            }
            orgs_data.append(existing_org)
            new_orgs += 1
        
        # Fetch research page
        research_url = org_info.get("research_url", org_info["url"])
        print(f"  Fetching: {research_url}")
        
        html = fetch_page(research_url)
        if not html:
            print(f"  ✗ Could not fetch page")
            continue
        
        # Extract publications
        print(f"  Extracting publications...")
        publications = extract_publications_with_llm(html, name)
        
        if not publications:
            print(f"  → No publications found")
            continue
        
        # Add new publications
        existing_urls = {p.get("url", "") for p in existing_org.get("projects", [])}
        existing_titles = {p.get("name", "").lower() for p in existing_org.get("projects", [])}
        
        added = 0
        for pub in publications:
            # Skip if already exists
            if pub.get("url") in existing_urls:
                continue
            if pub.get("name", "").lower() in existing_titles:
                continue
            
            project = {
                "name": pub.get("name", "Untitled"),
                "description": pub.get("description", ""),
                "status": "published",
                "url": pub.get("url", ""),
                "paper_url": pub.get("url", ""),
                "focus_areas": org_info["focus_areas"]
            }
            
            if "projects" not in existing_org:
                existing_org["projects"] = []
            
            existing_org["projects"].append(project)
            added += 1
            new_publications += 1
        
        print(f"  ✓ Added {added} publications")
        
        # Be nice to servers
        time.sleep(2)
    
    # Save updated data
    with open("ai_safety_orgs.json", "w") as f:
        json.dump(orgs_data, f, indent=2)
    
    print("\n" + "=" * 60)
    print("COMPLETE")
    print("=" * 60)
    print(f"New organizations: {new_orgs}")
    print(f"New publications: {new_publications}")
    print(f"Total organizations: {len(orgs_data)}")
    
    # Count totals
    total_projects = sum(len(org.get("projects", [])) for org in orgs_data)
    total_pubs = sum(
        len([p for p in org.get("projects", []) if p.get("status", "").lower() == "published" or p.get("paper_url")])
        for org in orgs_data
    )
    print(f"Total projects: {total_projects}")
    print(f"Total publications: {total_pubs}")


if __name__ == "__main__":
    scrape_research_orgs()


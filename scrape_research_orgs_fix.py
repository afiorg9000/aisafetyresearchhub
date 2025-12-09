"""
Fix and retry failed organization scrapes.
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

# Fixed URLs for failed orgs
ORGS_TO_FIX = [
    {
        "name": "Center for Human-Compatible AI",
        "url": "https://humancompatible.ai/",
        "research_url": "https://humancompatible.ai/research",  # Try /research instead
        "type": "Academic",
        "country": "USA",
        "focus_areas": ["Alignment", "Control", "Cooperative AI"],
        "mission": "Stuart Russell's research center at UC Berkeley focused on building AI systems that are provably beneficial to humans."
    },
    {
        "name": "NYU Alignment Research Group",
        "url": "https://wp.nyu.edu/arg/",
        "research_url": "https://wp.nyu.edu/arg/",  # Try main page
        "type": "Academic", 
        "country": "USA",
        "focus_areas": ["Alignment", "Evals", "Interpretability"],
        "mission": "Sam Bowman's research group at NYU focusing on language model alignment and evaluation."
    },
    {
        "name": "Centre for the Study of Existential Risk",
        "url": "https://www.cser.ac.uk/",
        "research_url": "https://www.cser.ac.uk/research/",  # Different path
        "type": "Academic",
        "country": "UK", 
        "focus_areas": ["Governance", "Policy", "Alignment"],
        "mission": "Cambridge University research centre studying existential risks including from advanced AI."
    },
    {
        "name": "Quantified Uncertainty Research Institute",
        "url": "https://quantifieduncertainty.org/",
        "research_url": "https://quantifieduncertainty.org/",  # Main page
        "type": "Nonprofit",
        "country": "USA",
        "focus_areas": ["Forecasting", "Evals"],
        "mission": "Research institute developing tools and methods for quantifying uncertainty and improving forecasting."
    },
    {
        "name": "Simon Institute for Longterm Governance",
        "url": "https://www.simoninstitute.ch/",
        "research_url": "https://www.simoninstitute.ch/",  # Main page
        "type": "Nonprofit",
        "country": "Switzerland",
        "focus_areas": ["Governance", "Policy"],
        "mission": "Geneva-based institute supporting multilateral governance of frontier technologies."
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
    
    soup = BeautifulSoup(html_content, 'html.parser')
    for tag in soup(['script', 'style', 'nav', 'footer', 'header']):
        tag.decompose()
    
    text = soup.get_text(separator='\n', strip=True)[:15000]
    
    prompt = f"""Extract ONLY PUBLISHED research papers/publications from this page for {org_name}.

Return a JSON array of publications. Each publication should have:
- "name": paper title
- "description": brief description (1-2 sentences max)
- "url": link to paper if available
- "status": "published"

Only include actual published papers/reports. Skip blog posts, news, events, jobs.
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


def fix_orgs():
    """Fix failed organizations"""
    print("=" * 60)
    print("FIXING FAILED ORGANIZATION SCRAPES")
    print("=" * 60)
    
    with open("ai_safety_orgs.json", "r") as f:
        orgs_data = json.load(f)
    
    new_publications = 0
    
    for org_info in ORGS_TO_FIX:
        name = org_info["name"]
        print(f"\n📚 {name}")
        
        # Find existing org
        existing_org = None
        for org in orgs_data:
            if org.get("name", "").lower() == name.lower():
                existing_org = org
                break
        
        if not existing_org:
            print(f"  ✗ Org not found, skipping")
            continue
        
        # Update mission if empty
        if not existing_org.get("mission") and org_info.get("mission"):
            existing_org["mission"] = org_info["mission"]
            print(f"  + Updated mission")
        
        # Fetch research page
        research_url = org_info.get("research_url", org_info["url"])
        print(f"  Fetching: {research_url}")
        
        html = fetch_page(research_url)
        if not html:
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
        time.sleep(2)
    
    # Save
    with open("ai_safety_orgs.json", "w") as f:
        json.dump(orgs_data, f, indent=2)
    
    print("\n" + "=" * 60)
    print(f"Fixed publications: {new_publications}")
    
    # Count totals
    total_projects = sum(len(org.get("projects", [])) for org in orgs_data)
    total_pubs = sum(
        len([p for p in org.get("projects", []) if p.get("status", "").lower() == "published" or p.get("paper_url")])
        for org in orgs_data
    )
    print(f"Total projects: {total_projects}")
    print(f"Total publications: {total_pubs}")


if __name__ == "__main__":
    fix_orgs()


"""
Find URLs and scrape the final 83 organizations.
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

# Research URLs for remaining orgs
REMAINING_ORGS = {
    # 8 staff
    "Guide Labs": ["https://guidelabs.ai/"],
    "CSIS Wadhwani AI Center": ["https://www.csis.org/programs/wadhwani-center-ai-and-advanced-technologies"],
    
    # 7 staff
    "Encode AI": ["https://encode.org/"],
    "Meridian": ["https://www.meridian.org/"],
    "MAIA": ["https://maia.ai/"],
    "Tarbell Fellowship": ["https://www.tarbellai.org/"],
    "Safe AI Forum": ["https://www.safeaiforum.org/"],
    "Forethought": ["https://forethought.org/"],
    "Arcadia Impact": ["https://www.arcadiaimpact.org/"],
    
    # 6 staff
    "Pivotal Research": ["https://pivotal-research.org/"],
    "Seismic": ["https://seismic.ai/"],
    "Odyssean Institute": ["https://odysseaninstitute.org/"],
    "Hortus AI": ["https://hortus.ai/"],
    "AVERI": ["https://averi.ai/"],
    "Tilde Research": ["https://tilderesearch.com/"],
    
    # 5 staff
    "Conscium": ["https://conscium.ai/"],
    "LISA": ["https://lisa.ai/"],
    "Geodesic Research": ["https://geodesic-research.org/"],
    "Dovetail Research": ["https://dovetailresearch.org/"],
    "AI Futures Project": ["https://aifuturesproject.org/"],
    "Whitebox Research": ["https://whitebox-research.org/"],
    "Cadenza Labs": ["https://cadenzalabs.ai/"],
    "EleosAI": ["https://eleos.ai/"],
    "Realm Labs": ["https://realmlabs.ai/"],
    "Heron AI Security": ["https://heron.ai/"],
    
    # 4 staff
    "TFI": ["https://tfi.ai/"],
    "CBAI": ["https://cbai.org/"],
    "Harmony Intelligence": ["https://harmonyintelligence.ai/"],
    "AI Safety Awareness Project": ["https://aisafetyawareness.org/"],
    "Noema Research": ["https://noemaresearch.org/"],
    "Evitable": ["https://evitable.ai/"],
    "GPAI Policy Lab": ["https://gpai.ai/"],
    "Golden Gate Institute for AI": ["https://goldengateinstitute.ai/"],
    "Charles University ACS": ["https://ufal.mff.cuni.cz/"],
    "Kairos": ["https://kairos.ai/"],
    
    # 3 staff
    "Truthful AI": ["https://truthful.ai/"],
    "AI Underwriting Company": ["https://aiunderwriting.com/"],
    "Midas Project": ["https://midasproject.org/"],
    "Oxford Martin AIGI": ["https://www.oxfordmartin.ox.ac.uk/ai-governance/"],
    "Watertight AI": ["https://watertight.ai/"],
    "MAI": ["https://mai.ai/"],
    "CLAIR": ["https://clair.ai/"],
    "Asymmetric Security": ["https://asymmetricsecurity.com/"],
    "Atlas Computing": ["https://atlascomputing.org/"],
    "Fulcrum Research": ["https://fulcrumresearch.org/"],
    "Safeguarded AI": ["https://safeguarded.ai/"],
    "Secure AI Project": ["https://secureaiproject.org/"],
    "Lucid Computing": ["https://lucidcomputing.ai/"],
    "Contramont Research": ["https://contramont.org/"],
    "Cosmos Institute": ["https://cosmosinstitute.org/"],
    "CaML": ["https://caml.ai/"],
    "Equilibria Network": ["https://equilibrianetwork.org/"],
    "EconTAI": ["https://econtai.org/"],
    "Aether": ["https://aether.ai/"],
    "CivAI": ["https://civai.org/"],
    "Equistamp": ["https://equistamp.ai/"],
    
    # 2 staff
    "dmodel": ["https://dmodel.ai/"],
    "CORAL": ["https://coral.ai/"],
    "Seldon Labs": ["https://seldonlabs.ai/"],
    "Principia Labs": ["https://principialabs.ai/"],
    "DeepResponse": ["https://deepresponse.ai/"],
    "Decode Research": ["https://decoderesearch.org/"],
    "Coordinal": ["https://coordinal.ai/"],
    "Mosaic Labs": ["https://mosaiclabs.ai/"],
    "Andon Labs": ["https://andonlabs.ai/"],
    "Workshop Labs": ["https://workshoplabs.ai/"],
    "Aelus": ["https://aelus.ai/"],
    "Simplex": ["https://simplex.ai/"],
    "Aethra Labs": ["https://aethralabs.ai/"],
    "Freestyle Research": ["https://freestyleresearch.org/"],
    "Theorem Labs": ["https://theoremlabs.ai/"],
    "Ulyssean": ["https://ulyssean.org/"],
    "Trajectory Labs": ["https://trajectorylabs.ai/"],
    "TamperSec": ["https://tampersec.ai/"],
    "AI Standards Lab": ["https://aistandardslab.org/"],
    "LASST": ["https://lasst.ai/"],
    
    # 1 staff
    "Groundless": ["https://groundless.ai/"],
    "Poseidon Research": ["https://poseidonresearch.org/"],
    "Formation Research": ["https://formationresearch.org/"],
    "Theomachia Labs": ["https://theomachialabs.ai/"],
    "Ashgro": ["https://ashgro.ai/"],
    "Deducto": ["https://deducto.ai/"],
    "Luthien": ["https://luthien.ai/"],
}


def fetch_page(url):
    """Try to fetch a page."""
    try:
        response = requests.get(
            url, 
            headers={"User-Agent": "Mozilla/5.0"},
            timeout=10,
            allow_redirects=True
        )
        if response.status_code == 200:
            return response.text
    except:
        pass
    
    # Try with Playwright
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(url, timeout=15000)
            time.sleep(1)
            content = page.content()
            browser.close()
            if len(content) > 500:
                return content
    except:
        pass
    
    return None


def search_for_org(org_name):
    """Use web search to find the org's website."""
    search_queries = [
        f"{org_name} AI safety",
        f"{org_name} AI research",
        f"{org_name} organization"
    ]
    
    # Try common URL patterns
    name_slug = org_name.lower().replace(" ", "").replace("-", "")
    potential_urls = [
        f"https://{name_slug}.ai/",
        f"https://{name_slug}.org/",
        f"https://{name_slug}.com/",
        f"https://www.{name_slug}.ai/",
        f"https://www.{name_slug}.org/",
    ]
    
    for url in potential_urls:
        content = fetch_page(url)
        if content and len(content) > 1000:
            return url, content
    
    return None, None


def extract_with_llm(org_name, content):
    """Extract research data using Claude."""
    if len(content) > 40000:
        content = content[:40000]
    
    prompt = f"""Extract research projects and key people from this AI safety organization's webpage.

Organization: {org_name}

Return JSON:
{{
    "projects": [{{"name": "...", "description": "...", "status": "Active"}}],
    "key_people": [{{"name": "...", "role": "..."}}]
}}

Only include what you can clearly identify. Return ONLY JSON.

Content:
{content}"""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )
        result = response.content[0].text.strip()
        if result.startswith("```"):
            result = re.sub(r'^```json?\n?', '', result)
            result = re.sub(r'\n?```$', '', result)
        return json.loads(result)
    except:
        return {"projects": [], "key_people": []}


def main():
    print("=" * 60)
    print("SCRAPING FINAL 83 ORGANIZATIONS")
    print("=" * 60)
    
    with open("ai_safety_orgs.json", "r") as f:
        orgs = json.load(f)
    
    org_lookup = {org["name"]: org for org in orgs}
    
    total_urls = 0
    total_projects = 0
    total_people = 0
    failed = []
    
    for org_name, urls in REMAINING_ORGS.items():
        if org_name not in org_lookup:
            continue
        
        print(f"\n{org_name}...")
        
        org = org_lookup[org_name]
        found_url = None
        content = None
        
        # Try provided URLs
        for url in urls:
            content = fetch_page(url)
            if content and len(content) > 500:
                found_url = url
                print(f"  ✓ Found: {url}")
                break
        
        # Try searching if no URL worked
        if not found_url:
            found_url, content = search_for_org(org_name)
            if found_url:
                print(f"  ✓ Found via search: {found_url}")
        
        if not found_url or not content:
            print(f"  ✗ No URL found")
            failed.append(org_name)
            continue
        
        # Update org URL
        org["url"] = found_url
        total_urls += 1
        
        # Extract content
        soup = BeautifulSoup(content, "html.parser")
        for el in soup(["script", "style", "nav", "footer"]):
            el.decompose()
        text = soup.get_text(separator="\n", strip=True)
        
        if len(text) > 200:
            extracted = extract_with_llm(org_name, text)
            
            # Add projects
            for proj in extracted.get("projects", []):
                if "projects" not in org:
                    org["projects"] = []
                existing = {p["name"].lower() for p in org["projects"]}
                if proj["name"].lower() not in existing:
                    org["projects"].append(proj)
                    total_projects += 1
            
            # Add people
            for person in extracted.get("key_people", []):
                if "key_people" not in org:
                    org["key_people"] = []
                existing = {p["name"].lower() for p in org["key_people"]}
                if person["name"].lower() not in existing:
                    org["key_people"].append(person)
                    total_people += 1
            
            if extracted.get("projects"):
                print(f"    +{len(extracted['projects'])} projects")
            if extracted.get("key_people"):
                print(f"    +{len(extracted['key_people'])} people")
        
        time.sleep(0.5)
    
    # Save
    with open("ai_safety_orgs.json", "w") as f:
        json.dump(orgs, f, indent=2)
    
    print("\n" + "=" * 60)
    print("COMPLETE")
    print("=" * 60)
    print(f"URLs found: {total_urls}")
    print(f"Projects added: {total_projects}")
    print(f"People added: {total_people}")
    print(f"Failed: {len(failed)}")
    if failed:
        print("Failed orgs:", ", ".join(failed[:20]))


if __name__ == "__main__":
    main()


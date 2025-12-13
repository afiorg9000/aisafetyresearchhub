#!/usr/bin/env python3
"""
Scrape ALL researchers from Future of Life Institute's AI Existential Safety Community
Using Playwright to click "Load more" buttons
"""

import json
import asyncio
from playwright.async_api import async_playwright

FLI_URL = "https://futureoflife.org/about-us/our-people/ai-existential-safety-community/"

async def scrape_all_researchers():
    """Use Playwright to click Load more and get all researchers."""
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        print("Loading FLI page...")
        await page.goto(FLI_URL, wait_until="networkidle")
        
        # Click all "Load more" buttons until they're gone
        while True:
            load_buttons = await page.query_selector_all('text="Load more"')
            if not load_buttons:
                break
            
            print(f"  Clicking {len(load_buttons)} 'Load more' buttons...")
            for btn in load_buttons:
                try:
                    await btn.click()
                    await page.wait_for_timeout(500)
                except:
                    pass
            
            await page.wait_for_timeout(1000)
        
        print("All researchers loaded. Extracting data...")
        
        # Extract researcher cards
        # The structure is typically: h4 (name), then p or span for role, then p for institution
        researchers = []
        
        # Get all profile sections
        content = await page.content()
        
        # Parse with BeautifulSoup
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(content, 'html.parser')
        
        # Find all profile cards - looking at the structure more carefully
        # Each researcher seems to be in a card/div with h4 for name
        
        # Skip these non-name h4s
        skip_texts = [
            "Load more", "Posts from the community", "Join the community",
            "Vitalik Buterin Fellowships", "AI Professors", "AI Researchers",
            "Were you looking for something else?", "Our Position on AI",
            "Report a broken link", "Past Volunteers", "Recent projects",
            "Focus areas", "Our work", "Our content", "About us",
            "The Impact of AI in Education", "Can AI agents learn to be good?"
        ]
        
        # Find all h4 elements that could be names
        h4_elements = soup.find_all('h4')
        
        for h4 in h4_elements:
            name = h4.get_text(strip=True)
            
            # Skip non-names
            if any(skip in name for skip in skip_texts):
                continue
            if len(name) > 50 or len(name) < 3:
                continue
            
            # Get the parent/sibling content for role and institution
            parent = h4.find_parent()
            if not parent:
                continue
            
            # Get all text within this card
            all_text = parent.get_text(separator="\n", strip=True).split("\n")
            
            role = None
            institution = None
            
            # Find where the name is and get the following items
            for i, line in enumerate(all_text):
                if line.strip() == name:
                    remaining = all_text[i+1:]
                    
                    for j, next_line in enumerate(remaining):
                        next_line = next_line.strip()
                        if next_line in ["View profile", "Load more", ""]:
                            continue
                        
                        # First non-skip line after name
                        role_keywords = ["Professor", "PhD", "Researcher", "Student", 
                                       "Associate", "Fellow", "Director", "Lead", 
                                       "Engineer", "Scientist"]
                        
                        if any(k in next_line for k in role_keywords):
                            role = next_line
                        else:
                            # Likely institution
                            if not institution:
                                institution = next_line
                            break
                        
                        # Check next line for institution
                        if j + 1 < len(remaining):
                            inst_candidate = remaining[j + 1].strip()
                            if inst_candidate not in ["View profile", "Load more", ""]:
                                if not any(k in inst_candidate for k in role_keywords):
                                    institution = inst_candidate
                                    break
                    break
            
            if name and (role or institution):
                researchers.append({
                    "name": name,
                    "role": role or "Researcher",
                    "institution": institution
                })
        
        await browser.close()
        return researchers

def load_existing_data():
    with open("ai_safety_orgs.json", "r") as f:
        return json.load(f)

def save_data(data):
    with open("ai_safety_orgs.json", "w") as f:
        json.dump(data, f, indent=2)

def add_researchers_to_orgs(researchers, orgs):
    """Add researchers to their respective organizations."""
    
    # Create org map
    org_map = {}
    for i, org in enumerate(orgs):
        org_map[org["name"].lower()] = i
    
    # Institution aliases
    aliases = {
        "uc berkeley": ["university of california, berkeley", "berkeley"],
        "mit": ["massachusetts institute of technology"],
        "stanford": ["stanford university"],
        "oxford": ["university of oxford"],
        "cambridge": ["university of cambridge"],
        "google deepmind": ["deepmind", "google deepmind safety"],
        "mila": ["mila, université de montréal", "université de montréal"],
        "far ai": ["far.ai"],
    }
    
    added = 0
    new_orgs = 0
    
    for r in researchers:
        inst = r.get("institution")
        if not inst:
            continue
        
        inst_lower = inst.lower().strip()
        org_idx = None
        
        # Direct match
        for org_name, idx in org_map.items():
            if inst_lower == org_name or inst_lower in org_name or org_name in inst_lower:
                org_idx = idx
                break
        
        # Alias match
        if org_idx is None:
            for alias, variants in aliases.items():
                if any(v in inst_lower or inst_lower in v for v in variants + [alias]):
                    for org_name, idx in org_map.items():
                        if any(v in org_name for v in variants + [alias]):
                            org_idx = idx
                            break
                    break
        
        if org_idx is not None:
            org = orgs[org_idx]
            if "key_people" not in org:
                org["key_people"] = []
            
            existing = [p.get("name", "").lower() for p in org["key_people"]]
            if r["name"].lower() not in existing:
                org["key_people"].append({
                    "name": r["name"],
                    "role": r.get("role", "AI Safety Researcher")
                })
                added += 1
                print(f"  Added {r['name']} to {org['name']}")
        else:
            # Create new org if it's an institution
            if any(kw in inst_lower for kw in ["university", "institute", "college", "lab", "center", "research"]):
                if inst_lower not in org_map:
                    new_org = {
                        "name": inst,
                        "type": "Academic",
                        "focus_areas": ["AI Safety Research"],
                        "key_people": [{
                            "name": r["name"],
                            "role": r.get("role", "AI Safety Researcher")
                        }],
                        "source": "FLI AI Existential Safety Community"
                    }
                    orgs.append(new_org)
                    org_map[inst_lower] = len(orgs) - 1
                    new_orgs += 1
                    added += 1
                    print(f"  Created: {inst} with {r['name']}")
                else:
                    idx = org_map[inst_lower]
                    org = orgs[idx]
                    if "key_people" not in org:
                        org["key_people"] = []
                    existing = [p.get("name", "").lower() for p in org["key_people"]]
                    if r["name"].lower() not in existing:
                        org["key_people"].append({
                            "name": r["name"],
                            "role": r.get("role", "AI Safety Researcher")
                        })
                        added += 1
    
    return added, new_orgs

async def main():
    print("=" * 60)
    print("Scraping FLI AI Existential Safety Community (Full)")
    print("=" * 60)
    
    researchers = await scrape_all_researchers()
    
    # Remove duplicates
    seen = set()
    unique = []
    for r in researchers:
        key = r["name"].lower()
        if key not in seen:
            seen.add(key)
            unique.append(r)
            print(f"  {r['name']} - {r.get('role', 'Researcher')} @ {r.get('institution', '?')}")
    
    researchers = unique
    print(f"\nFound {len(researchers)} unique researchers")
    
    # Load and update
    print("\nLoading existing data...")
    orgs = load_existing_data()
    
    print("\nAdding to organizations...")
    added, new_orgs = add_researchers_to_orgs(researchers, orgs)
    
    save_data(orgs)
    
    print(f"\n{'=' * 60}")
    print(f"SUMMARY")
    print(f"{'=' * 60}")
    print(f"Researchers found: {len(researchers)}")
    print(f"Researchers added: {added}")
    print(f"New organizations: {new_orgs}")
    print(f"Total organizations: {len(orgs)}")

if __name__ == "__main__":
    asyncio.run(main())




#!/usr/bin/env python3
"""
Scrape researchers from Future of Life Institute's AI Existential Safety Community
https://futureoflife.org/about-us/our-people/ai-existential-safety-community/
"""

import json
import requests
from bs4 import BeautifulSoup
import time

FLI_URL = "https://futureoflife.org/about-us/our-people/ai-existential-safety-community/"

def scrape_fli_researchers():
    """Scrape faculty and researchers from FLI community page."""
    print("Fetching FLI AI Existential Safety Community page...")
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    }
    
    response = requests.get(FLI_URL, headers=headers)
    if response.status_code != 200:
        print(f"Failed to fetch page: {response.status_code}")
        return []
    
    soup = BeautifulSoup(response.text, "html.parser")
    
    researchers = []
    
    # Find all profile cards - they typically have name, title, and institution
    # Looking for the structure: name, optional title, institution
    profiles = soup.find_all("h4")
    
    for h4 in profiles:
        name = h4.get_text(strip=True)
        
        # Skip non-name headers
        if name in ["Load more", "Posts from the community", "Join the community", 
                    "Vitalik Buterin Fellowships", "AI Professors", "AI Researchers",
                    "Were you looking for something else?", "Our Position on AI",
                    "Report a broken link", "Past Volunteers"]:
            continue
        
        # Skip if it looks like an article title (too long)
        if len(name) > 50:
            continue
        
        # Get the parent container to find role and institution
        parent = h4.find_parent()
        if parent:
            text_content = parent.get_text(separator="\n", strip=True).split("\n")
            
            role = None
            institution = None
            
            # Parse the text - usually format is: Name, Role (optional), Institution
            for i, line in enumerate(text_content):
                if line == name:
                    # Next lines should be role and institution
                    if i + 1 < len(text_content):
                        next_line = text_content[i + 1].strip()
                        if next_line not in ["View profile", "Load more"]:
                            # Check if it's a role (contains Professor, PhD, etc.)
                            role_keywords = ["Professor", "PhD", "Researcher", "Student", "Associate", "Fellow"]
                            if any(k in next_line for k in role_keywords):
                                role = next_line
                                if i + 2 < len(text_content):
                                    inst = text_content[i + 2].strip()
                                    if inst not in ["View profile", "Load more"]:
                                        institution = inst
                            else:
                                # It's probably the institution
                                institution = next_line
                    break
        
        researcher = {
            "name": name,
            "role": role,
            "institution": institution,
            "source": "Future of Life Institute AI Existential Safety Community"
        }
        researchers.append(researcher)
        print(f"  Found: {name} - {role or 'Researcher'} @ {institution or 'Unknown'}")
    
    return researchers

def load_existing_data():
    """Load existing organizations data."""
    with open("ai_safety_orgs.json", "r") as f:
        return json.load(f)

def save_data(data):
    """Save updated data."""
    with open("ai_safety_orgs.json", "w") as f:
        json.dump(data, f, indent=2)

def add_researchers_to_orgs(researchers, orgs):
    """Add researchers to their respective organizations."""
    
    # Create a mapping of institution names to org indices
    org_map = {}
    for i, org in enumerate(orgs):
        org_map[org["name"].lower()] = i
        # Add common abbreviations/variations
        name_lower = org["name"].lower()
        if "university" in name_lower:
            short = name_lower.replace("university of ", "").replace(" university", "")
            org_map[short] = i
    
    # Common institution mappings
    institution_aliases = {
        "uc berkeley": "university of california, berkeley",
        "mit": "massachusetts institute of technology",
        "stanford": "stanford university",
        "oxford": "university of oxford",
        "cambridge": "university of cambridge",
        "google deepmind": "google deepmind",
        "deepmind": "google deepmind",
        "openai": "openai",
        "anthropic": "anthropic",
        "mila": "mila",
        "far ai": "far.ai",
        "redwood research": "redwood research",
        "alignment research center": "alignment research center",
        "arc": "alignment research center",
    }
    
    added_count = 0
    new_orgs_added = 0
    
    for researcher in researchers:
        institution = researcher.get("institution")
        if not institution:
            continue
        
        inst_lower = institution.lower().strip()
        
        # Try to find matching org
        org_idx = None
        
        # Direct match
        if inst_lower in org_map:
            org_idx = org_map[inst_lower]
        else:
            # Try aliases
            for alias, canonical in institution_aliases.items():
                if alias in inst_lower or inst_lower in alias:
                    if canonical.lower() in org_map:
                        org_idx = org_map[canonical.lower()]
                        break
            
            # Fuzzy match - check if any org name is contained in institution
            if org_idx is None:
                for org_name, idx in org_map.items():
                    if len(org_name) > 5 and (org_name in inst_lower or inst_lower in org_name):
                        org_idx = idx
                        break
        
        if org_idx is not None:
            # Add to existing org
            org = orgs[org_idx]
            if "key_people" not in org:
                org["key_people"] = []
            
            # Check if already exists
            existing_names = [p.get("name", "").lower() for p in org["key_people"]]
            if researcher["name"].lower() not in existing_names:
                person_entry = {
                    "name": researcher["name"],
                    "role": researcher.get("role", "AI Safety Researcher")
                }
                org["key_people"].append(person_entry)
                added_count += 1
                print(f"  Added {researcher['name']} to {org['name']}")
        else:
            # Create new org for this institution if it looks like a real institution
            if any(keyword in inst_lower for keyword in ["university", "institute", "lab", "center", "research"]):
                # Check if we already added this institution
                if inst_lower not in org_map:
                    new_org = {
                        "name": institution,
                        "type": "Academic",
                        "focus_areas": ["AI Safety Research"],
                        "key_people": [{
                            "name": researcher["name"],
                            "role": researcher.get("role", "AI Safety Researcher")
                        }],
                        "mission": f"Academic institution with researchers in AI safety",
                        "source": "FLI AI Existential Safety Community"
                    }
                    orgs.append(new_org)
                    org_map[inst_lower] = len(orgs) - 1
                    new_orgs_added += 1
                    added_count += 1
                    print(f"  Created new org: {institution} with {researcher['name']}")
                else:
                    # Add to the new org we just created
                    org_idx = org_map[inst_lower]
                    org = orgs[org_idx]
                    existing_names = [p.get("name", "").lower() for p in org.get("key_people", [])]
                    if researcher["name"].lower() not in existing_names:
                        if "key_people" not in org:
                            org["key_people"] = []
                        org["key_people"].append({
                            "name": researcher["name"],
                            "role": researcher.get("role", "AI Safety Researcher")
                        })
                        added_count += 1
    
    return added_count, new_orgs_added

def main():
    print("=" * 60)
    print("Scraping FLI AI Existential Safety Community")
    print("=" * 60)
    
    # Scrape researchers
    researchers = scrape_fli_researchers()
    print(f"\nFound {len(researchers)} researchers")
    
    if not researchers:
        print("No researchers found. Exiting.")
        return
    
    # Load existing data
    print("\nLoading existing data...")
    orgs = load_existing_data()
    print(f"Loaded {len(orgs)} organizations")
    
    # Add researchers
    print("\nAdding researchers to organizations...")
    added, new_orgs = add_researchers_to_orgs(researchers, orgs)
    
    # Save
    print(f"\nSaving data...")
    save_data(orgs)
    
    print(f"\n{'=' * 60}")
    print(f"SUMMARY")
    print(f"{'=' * 60}")
    print(f"Researchers scraped: {len(researchers)}")
    print(f"Researchers added: {added}")
    print(f"New organizations created: {new_orgs}")
    print(f"Total organizations: {len(orgs)}")

if __name__ == "__main__":
    main()




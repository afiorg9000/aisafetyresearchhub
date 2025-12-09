"""
Scrape actual researcher names from AI safety organizations.
Sources:
1. MATS scholars from Airtable
2. Team pages from major orgs
3. Paper authors from publications
"""

import json
import time
import re
import requests
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

def scrape_mats_scholars():
    """Scrape MATS scholars from Airtable."""
    print("\n1. Scraping MATS scholars...")
    url = "https://airtable.com/appgYHwg8mqw7IcaE/shrnETzJyPjfFFRb4"
    scholars = []
    
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(url, timeout=60000)
            page.wait_for_selector("[data-rowindex]", timeout=30000)
            
            # Scroll to load all content
            last_count = 0
            for _ in range(20):  # Max 20 scroll attempts
                page.keyboard.press("End")
                time.sleep(1)
                rows = page.query_selector_all("[data-rowindex]")
                if len(rows) == last_count:
                    break
                last_count = len(rows)
                print(f"  Found {last_count} rows...")
            
            # Extract scholar names from rows
            for row in rows:
                cells = row.query_selector_all(".cell")
                if cells:
                    # First cell usually contains the name/title
                    text = cells[0].inner_text().strip()
                    if text and len(text) > 2:
                        # Try to extract author names from the description
                        # Format is usually "Paper title. Authors: Name1, Name2"
                        if "Authors:" in text:
                            authors_part = text.split("Authors:")[-1].strip()
                            names = [n.strip() for n in authors_part.split(",")]
                            scholars.extend(names)
                        # Also check Scholar column if it exists
                        if len(cells) > 2:
                            scholar_text = cells[2].inner_text().strip()
                            if scholar_text:
                                names = [n.strip() for n in scholar_text.replace(" and ", ",").split(",")]
                                scholars.extend(names)
            
            browser.close()
    except Exception as e:
        print(f"  Error scraping MATS: {e}")
    
    # Deduplicate and clean
    clean_scholars = []
    seen = set()
    for name in scholars:
        name = name.strip()
        # Filter out non-names
        if len(name) > 3 and len(name) < 50 and name.lower() not in seen:
            if not any(x in name.lower() for x in ['http', 'www', '.com', 'research', 'paper', 'authors']):
                clean_scholars.append(name)
                seen.add(name.lower())
    
    print(f"  Found {len(clean_scholars)} MATS scholars")
    return [{"name": name, "org": "MATS", "role": "Scholar"} for name in clean_scholars]


def scrape_alignment_forum_authors():
    """Scrape top authors from Alignment Forum."""
    print("\n2. Scraping Alignment Forum top authors...")
    authors = []
    
    try:
        # Get the users page or popular posts
        response = requests.get(
            "https://www.alignmentforum.org/allPosts",
            headers={"User-Agent": "Mozilla/5.0"},
            timeout=30
        )
        soup = BeautifulSoup(response.content, "html.parser")
        
        # Look for author links
        author_links = soup.find_all("a", href=re.compile(r"/users/"))
        seen = set()
        for link in author_links:
            name = link.get_text().strip()
            if name and len(name) > 2 and name.lower() not in seen:
                authors.append(name)
                seen.add(name.lower())
                if len(authors) >= 100:  # Limit
                    break
        
    except Exception as e:
        print(f"  Error scraping AF: {e}")
    
    print(f"  Found {len(authors)} AF authors")
    return [{"name": name, "org": "Alignment Forum", "role": "Author"} for name in authors]


def scrape_org_team_page(org_name, url, selectors=None):
    """Scrape team members from an org's website."""
    print(f"  Scraping {org_name}...")
    people = []
    
    try:
        response = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=30)
        soup = BeautifulSoup(response.content, "html.parser")
        
        # Common patterns for team pages
        name_patterns = [
            "h3", "h4", ".team-member-name", ".person-name", 
            ".staff-name", "[class*='name']", "[class*='team'] h3",
            ".card-title", ".member-name"
        ]
        
        seen = set()
        for pattern in name_patterns:
            elements = soup.select(pattern)
            for el in elements:
                text = el.get_text().strip()
                # Filter for likely names (2-4 words, reasonable length)
                words = text.split()
                if 2 <= len(words) <= 4 and 5 < len(text) < 50:
                    # Check if it looks like a name (capitalized words)
                    if all(w[0].isupper() for w in words if w):
                        if text.lower() not in seen:
                            people.append(text)
                            seen.add(text.lower())
        
    except Exception as e:
        print(f"    Error: {e}")
    
    return [{"name": name, "org": org_name, "role": "Staff"} for name in people[:50]]  # Limit per org


def extract_authors_from_publications():
    """Extract author names from existing publication data."""
    print("\n3. Extracting authors from publications...")
    
    try:
        with open("ai_safety_orgs.json", "r") as f:
            orgs = json.load(f)
    except:
        return []
    
    authors = []
    seen = set()
    
    for org in orgs:
        for project in org.get("projects", []):
            desc = project.get("description", "")
            # Look for "Authors: " pattern
            if "Authors:" in desc:
                authors_part = desc.split("Authors:")[-1].strip()
                # Split by comma, semicolon, or "and"
                names = re.split(r'[,;]|\s+and\s+', authors_part)
                for name in names:
                    name = name.strip()
                    # Clean up
                    name = re.sub(r'\(.*?\)', '', name).strip()
                    name = re.sub(r'\.\.\..*', '', name).strip()
                    
                    if len(name) > 3 and len(name) < 50 and name.lower() not in seen:
                        words = name.split()
                        if 1 <= len(words) <= 4:
                            authors.append({"name": name, "org": org["name"], "role": "Author"})
                            seen.add(name.lower())
    
    print(f"  Extracted {len(authors)} authors from publications")
    return authors


def scrape_anthropic_team():
    """Scrape Anthropic research team."""
    print("\n4. Scraping Anthropic research team...")
    people = []
    
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto("https://www.anthropic.com/company", timeout=60000)
            time.sleep(3)
            
            # Look for team section
            content = page.content()
            soup = BeautifulSoup(content, "html.parser")
            
            # Find name patterns
            for el in soup.find_all(["h3", "h4", "p"]):
                text = el.get_text().strip()
                words = text.split()
                if 2 <= len(words) <= 3 and 5 < len(text) < 40:
                    if all(w[0].isupper() for w in words if w and len(w) > 1):
                        people.append(text)
            
            browser.close()
    except Exception as e:
        print(f"  Error: {e}")
    
    # Deduplicate
    seen = set()
    unique = []
    for name in people:
        if name.lower() not in seen:
            unique.append({"name": name, "org": "Anthropic", "role": "Researcher"})
            seen.add(name.lower())
    
    print(f"  Found {len(unique)} Anthropic team members")
    return unique[:30]


def main():
    print("=" * 60)
    print("SCRAPING RESEARCHERS FROM AI SAFETY ORGANIZATIONS")
    print("=" * 60)
    
    all_researchers = []
    
    # 1. MATS scholars
    mats = scrape_mats_scholars()
    all_researchers.extend(mats)
    
    # 2. Authors from existing publications
    pub_authors = extract_authors_from_publications()
    all_researchers.extend(pub_authors)
    
    # 3. Alignment Forum (might be rate limited)
    # af_authors = scrape_alignment_forum_authors()
    # all_researchers.extend(af_authors)
    
    # 4. Anthropic team
    # anthropic = scrape_anthropic_team()
    # all_researchers.extend(anthropic)
    
    # Deduplicate across all sources
    print("\n" + "=" * 60)
    print("DEDUPLICATING...")
    
    seen = set()
    unique_researchers = []
    for r in all_researchers:
        key = r["name"].lower().strip()
        if key not in seen and len(key) > 3:
            unique_researchers.append(r)
            seen.add(key)
    
    print(f"Total unique researchers: {len(unique_researchers)}")
    
    # Save to file
    with open("researchers.json", "w") as f:
        json.dump(unique_researchers, f, indent=2)
    
    print(f"\nSaved to researchers.json")
    
    # Now update ai_safety_orgs.json to add researchers to orgs
    print("\nUpdating organizations with researchers...")
    
    try:
        with open("ai_safety_orgs.json", "r") as f:
            orgs = json.load(f)
        
        # Group researchers by org
        by_org = {}
        for r in unique_researchers:
            org = r["org"]
            if org not in by_org:
                by_org[org] = []
            by_org[org].append({"name": r["name"], "role": r["role"]})
        
        # Update orgs
        updated = 0
        for org in orgs:
            org_name = org["name"]
            if org_name in by_org:
                if "key_people" not in org:
                    org["key_people"] = []
                
                existing_names = {p["name"].lower() for p in org["key_people"]}
                for person in by_org[org_name]:
                    if person["name"].lower() not in existing_names:
                        org["key_people"].append(person)
                        updated += 1
        
        with open("ai_safety_orgs.json", "w") as f:
            json.dump(orgs, f, indent=2)
        
        print(f"Added {updated} researchers to organizations")
        
    except Exception as e:
        print(f"Error updating orgs: {e}")
    
    # Print summary by org
    print("\n" + "=" * 60)
    print("RESEARCHERS BY ORGANIZATION")
    print("=" * 60)
    
    org_counts = {}
    for r in unique_researchers:
        org = r["org"]
        org_counts[org] = org_counts.get(org, 0) + 1
    
    for org, count in sorted(org_counts.items(), key=lambda x: -x[1])[:20]:
        print(f"  {org}: {count}")


if __name__ == "__main__":
    main()


"""
Full MATS publications scraper that scrolls through the entire Airtable.
Integrates publications as projects in the main ai_safety_orgs.json.
"""

from playwright.sync_api import sync_playwright
import json
import time
import re


def scrape_mats_publications():
    """Scrape all MATS publications from Airtable with scrolling."""
    
    url = "https://airtable.com/appgYHwg8mqw7IcaE/shrnETzJyPjfFFRb4"
    publications = []
    seen_titles = set()
    
    with sync_playwright() as p:
        # Use headed mode for better compatibility
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto(url)
        
        # Wait for page to fully load
        print("Waiting for page to load...")
        page.wait_for_load_state("networkidle", timeout=60000)
        time.sleep(5)  # Extra wait for JS rendering
        
        # Scroll and collect
        max_scrolls = 25
        no_new_count = 0
        
        for scroll in range(max_scrolls):
            prev_count = len(publications)
            
            # Get all links to arxiv/papers
            links = page.query_selector_all("a[href*='arxiv'], a[href*='lesswrong'], a[href*='openreview'], a[href*='anthropic'], a[href*='zenodo']")
            
            for link in links:
                try:
                    href = link.get_attribute("href")
                    if not href:
                        continue
                    
                    # Get the parent button/row to extract title
                    parent = link.evaluate("el => el.closest('button')")
                    if not parent:
                        continue
                    
                    # Get all text in the parent
                    text = page.evaluate("el => el.innerText", parent)
                    lines = [l.strip() for l in text.split('\n') if l.strip()]
                    
                    if not lines:
                        continue
                    
                    # First line is usually the title
                    title = lines[0]
                    
                    # Skip headers
                    if title in ['Name', 'URL', 'Scholar', 'Open'] or len(title) < 15:
                        continue
                    
                    if title in seen_titles:
                        continue
                    
                    # Extract authors (lines that don't look like URLs)
                    authors = []
                    for line in lines[1:]:
                        if not line.startswith("http") and not line.startswith("/url") and line != "Open":
                            authors.append(line)
                    
                    seen_titles.add(title)
                    publications.append({
                        "title": title,
                        "url": href,
                        "authors": authors
                    })
                    
                except Exception as e:
                    continue
            
            print(f"Scroll {scroll + 1}: {len(publications)} publications found...")
            
            # Check if we're still finding new ones
            if len(publications) == prev_count:
                no_new_count += 1
                if no_new_count >= 3:
                    print("No new publications for 3 scrolls, ending...")
                    break
            else:
                no_new_count = 0
            
            # Scroll down
            page.keyboard.press("PageDown")
            time.sleep(1)
        
        browser.close()
    
    return publications


def add_to_orgs_json(publications):
    """Add MATS publications as projects in ai_safety_orgs.json."""
    
    with open("ai_safety_orgs.json", "r") as f:
        data = json.load(f)
    
    # Find MATS org
    mats_idx = None
    for i, org in enumerate(data):
        if org.get("name") == "MATS (ML Alignment Theory Scholars)":
            mats_idx = i
            break
    
    if mats_idx is None:
        print("ERROR: MATS organization not found!")
        return
    
    # Get existing project names to avoid duplicates
    existing_projects = set()
    if "projects" in data[mats_idx] and data[mats_idx]["projects"]:
        for p in data[mats_idx]["projects"]:
            if isinstance(p, dict):
                existing_projects.add(p.get("name", ""))
            else:
                existing_projects.add(p)
    
    # Initialize projects list if empty
    if not data[mats_idx].get("projects"):
        data[mats_idx]["projects"] = []
    
    # Add publications as projects
    added = 0
    for pub in publications:
        title = pub["title"]
        
        # Clean title
        if title.startswith("Publications LessWrong"):
            continue  # Skip meta entries
        
        if title in existing_projects:
            continue
        
        project = {
            "name": title,
            "status": "published",
            "description": f"Research paper by MATS scholars. Authors: {', '.join(pub['authors']) if pub['authors'] else 'MATS Scholars'}",
            "paper_url": pub["url"]
        }
        
        data[mats_idx]["projects"].append(project)
        existing_projects.add(title)
        added += 1
    
    # Save updated data
    with open("ai_safety_orgs.json", "w") as f:
        json.dump(data, f, indent=2)
    
    print(f"Added {added} new publications to MATS projects")
    print(f"Total MATS projects: {len(data[mats_idx]['projects'])}")
    
    return added


if __name__ == "__main__":
    print("Scraping MATS publications from Airtable...")
    publications = scrape_mats_publications()
    
    print(f"\n✓ Found {len(publications)} total publications")
    
    # Save raw publications for reference
    with open("mats_publications.json", "w") as f:
        json.dump(publications, f, indent=2)
    
    print("\n✓ Saved to mats_publications.json")
    
    # Add to main orgs JSON
    print("\nAdding to ai_safety_orgs.json...")
    add_to_orgs_json(publications)
    
    print("\n✓ Done! Now run:")
    print("  python convert_to_airtable.py")
    print("  cp ai_safety_orgs.json web/app/data.json")

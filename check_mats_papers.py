#!/usr/bin/env python3
"""
Check which MATS papers are already in the database and which are missing.
"""

import json
import csv

def load_orgs():
    with open("ai_safety_orgs.json", "r") as f:
        return json.load(f)

def load_mats_papers():
    papers = []
    with open("/Users/somendez/Downloads/MATS citations - Papers.csv", "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get("title") and row.get("title").strip():
                papers.append({
                    "title": row["title"].strip(),
                    "url": row.get("url", "").strip(),
                    "citations": int(row.get("best_citation_count", 0) or 0),
                    "year": row.get("year", "").strip(),
                })
    return papers

def normalize(s):
    """Normalize string for comparison."""
    return s.lower().replace("-", " ").replace(":", "").replace("'", "").replace('"', "").strip()

def main():
    orgs = load_orgs()
    mats_papers = load_mats_papers()
    
    # Get all existing project titles
    existing_titles = set()
    for org in orgs:
        for p in org.get("projects", []):
            existing_titles.add(normalize(p["name"]))
    
    print(f"MATS papers: {len(mats_papers)}")
    print(f"Existing projects: {len(existing_titles)}")
    print()
    
    # Check which are missing
    found = []
    missing = []
    
    for paper in mats_papers:
        title_norm = normalize(paper["title"])
        
        # Check for exact or fuzzy match
        matched = False
        for existing in existing_titles:
            # Check if one contains the other (for partial matches)
            if title_norm == existing or title_norm in existing or existing in title_norm:
                matched = True
                break
            # Check word overlap
            paper_words = set(title_norm.split())
            existing_words = set(existing.split())
            overlap = len(paper_words & existing_words)
            if overlap >= min(4, len(paper_words) - 1) and overlap >= len(paper_words) * 0.6:
                matched = True
                break
        
        if matched:
            found.append(paper)
        else:
            missing.append(paper)
    
    print(f"Found in database: {len(found)}")
    print(f"Missing from database: {len(missing)}")
    print()
    
    # Sort missing by citations (highest first)
    missing.sort(key=lambda x: x["citations"], reverse=True)
    
    print("=" * 60)
    print("TOP MISSING PAPERS (by citations)")
    print("=" * 60)
    for i, paper in enumerate(missing[:30]):
        print(f"{i+1}. [{paper['citations']} citations] {paper['title'][:70]}...")
        print(f"   {paper['url']}")
        print()
    
    # Save missing papers for import
    with open("missing_mats_papers.json", "w") as f:
        json.dump(missing, f, indent=2)
    
    print(f"\nSaved {len(missing)} missing papers to missing_mats_papers.json")

if __name__ == "__main__":
    main()


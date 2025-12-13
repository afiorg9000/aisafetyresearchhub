#!/usr/bin/env python3
"""
Add missing MATS papers to the database.
"""

import json

def load_orgs():
    with open("ai_safety_orgs.json", "r") as f:
        return json.load(f)

def save_orgs(orgs):
    with open("ai_safety_orgs.json", "w") as f:
        json.dump(orgs, f, indent=2)

def load_missing():
    with open("missing_mats_papers.json", "r") as f:
        return json.load(f)

def main():
    orgs = load_orgs()
    missing = load_missing()
    
    # Find or create MATS org
    mats_idx = None
    for i, org in enumerate(orgs):
        if "MATS" in org["name"] or "ML Alignment Theory Scholars" in org["name"]:
            mats_idx = i
            break
    
    if mats_idx is None:
        # Create MATS org
        mats_org = {
            "name": "MATS (ML Alignment Theory Scholars)",
            "type": "Training Program",
            "focus_areas": ["AI Safety", "Mechanistic Interpretability", "Alignment Research"],
            "website": "https://www.matsprogram.org/",
            "mission": "Training program for AI alignment researchers, producing high-impact safety research",
            "projects": [],
            "source": "MATS Citations Database"
        }
        orgs.append(mats_org)
        mats_idx = len(orgs) - 1
        print("Created MATS organization")
    
    mats_org = orgs[mats_idx]
    if "projects" not in mats_org:
        mats_org["projects"] = []
    
    # Add missing papers
    added = 0
    for paper in missing:
        project = {
            "name": paper["title"],
            "description": f"MATS research paper ({paper.get('year', 'recent')})",
            "status": "Published",
            "paper_url": paper["url"],
            "citation_count": paper["citations"],
            "source": "MATS Citations Database"
        }
        mats_org["projects"].append(project)
        added += 1
        print(f"  Added: {paper['title'][:60]}... ({paper['citations']} citations)")
    
    save_orgs(orgs)
    
    print(f"\nAdded {added} MATS papers")
    print(f"Total MATS projects: {len(mats_org['projects'])}")

if __name__ == "__main__":
    main()


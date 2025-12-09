"""Add MATS publications to ai_safety_orgs.json as projects."""

import json


def main():
    # Load publications
    with open("mats_publications.json", "r") as f:
        publications = json.load(f)
    
    # Load main data
    with open("ai_safety_orgs.json", "r") as f:
        data = json.load(f)
    
    # Find MATS org
    mats_idx = None
    for i, org in enumerate(data):
        if org.get("name") == "MATS":
            mats_idx = i
            break
    
    if mats_idx is None:
        print("ERROR: MATS organization not found!")
        return
    
    # Get existing project names
    existing_names = set()
    if data[mats_idx].get("projects"):
        for p in data[mats_idx]["projects"]:
            if isinstance(p, dict):
                existing_names.add(p.get("name", ""))
            else:
                existing_names.add(p)
    else:
        data[mats_idx]["projects"] = []
    
    # Add publications
    added = 0
    for pub in publications:
        title = pub["title"]
        if title in existing_names:
            continue
        
        authors_str = ", ".join(pub["authors"]) if pub["authors"] else "MATS Scholars"
        
        project = {
            "name": title,
            "status": "published",
            "description": f"Research paper by MATS scholars. Authors: {authors_str}",
            "paper_url": pub["url"]
        }
        
        data[mats_idx]["projects"].append(project)
        existing_names.add(title)
        added += 1
    
    # Save
    with open("ai_safety_orgs.json", "w") as f:
        json.dump(data, f, indent=2)
    
    print(f"✓ Added {added} publications to MATS")
    print(f"✓ Total MATS projects: {len(data[mats_idx]['projects'])}")


if __name__ == "__main__":
    main()


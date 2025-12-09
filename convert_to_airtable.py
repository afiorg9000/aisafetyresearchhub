"""
Convert scraped JSON to Airtable-importable CSVs.
Run this after scraper.py generates ai_safety_orgs.json
"""

import json
import csv
from datetime import date

def main():
    with open("ai_safety_orgs.json", "r") as f:
        orgs = json.load(f)
    
    today = date.today().isoformat()
    
    # === Organizations CSV ===
    org_rows = []
    for org in orgs:
        org_rows.append({
            "Name": org["name"],
            "Type": org["type"],
            "Country": org["country"],
            "Website": org["url"],
            "Focus Areas": ", ".join(org.get("focus_areas", [])),
            "Mission": org.get("mission", ""),
            "Notes": org.get("notes", ""),
            "Last Verified": today,
        })
    
    with open("airtable_organizations.csv", "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=org_rows[0].keys())
        writer.writeheader()
        writer.writerows(org_rows)
    print(f"✓ Wrote {len(org_rows)} organizations to airtable_organizations.csv")
    
    # === People CSV ===
    people_rows = []
    for org in orgs:
        for person in org.get("key_people", []):
            people_rows.append({
                "Name": person.get("name", ""),
                "Role": person.get("role", ""),
                "Organization": org["name"],  # Will need to link manually in Airtable
            })
    
    if people_rows:
        with open("airtable_people.csv", "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=people_rows[0].keys())
            writer.writeheader()
            writer.writerows(people_rows)
        print(f"✓ Wrote {len(people_rows)} people to airtable_people.csv")
    
    # === Projects CSV ===
    project_rows = []
    for org in orgs:
        for project in org.get("projects", []):
            project_rows.append({
                "Name": project.get("name", ""),
                "Description": project.get("description", ""),
                "Status": project.get("status", "Unknown"),
                "Organization": org["name"],
                "Last Activity": today,
            })
    
    if project_rows:
        with open("airtable_projects.csv", "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=project_rows[0].keys())
            writer.writeheader()
            writer.writerows(project_rows)
        print(f"✓ Wrote {len(project_rows)} projects to airtable_projects.csv")
    
    # === Benchmarks CSV ===
    benchmark_rows = []
    for org in orgs:
        for bench in org.get("benchmarks", []):
            benchmark_rows.append({
                "Name": bench.get("name", ""),
                "Measures": bench.get("measures", ""),
                "Paper URL": bench.get("paper_url", ""),
                "Created By": org["name"],
                "Status": "Active",
            })
    
    if benchmark_rows:
        with open("airtable_benchmarks.csv", "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=benchmark_rows[0].keys())
            writer.writeheader()
            writer.writerows(benchmark_rows)
        print(f"✓ Wrote {len(benchmark_rows)} benchmarks to airtable_benchmarks.csv")
    
    print(f"\nDone! Import CSVs into Airtable in this order:")
    print("  1. airtable_organizations.csv")
    print("  2. airtable_people.csv (then link to Organizations)")
    print("  3. airtable_projects.csv (then link to Organizations)")
    print("  4. airtable_benchmarks.csv (then link to Organizations)")


if __name__ == "__main__":
    main()


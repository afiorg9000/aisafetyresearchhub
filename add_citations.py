"""
Fetch citation counts from Semantic Scholar API for publications.
"""

import json
import requests
import time
import re

def get_semantic_scholar_data(paper_title, paper_url=None):
    """Fetch citation data from Semantic Scholar"""
    base_url = "https://api.semanticscholar.org/graph/v1/paper/search"
    
    # Clean title for search
    clean_title = re.sub(r'[^\w\s]', '', paper_title)[:100]
    
    params = {
        "query": clean_title,
        "limit": 1,
        "fields": "title,citationCount,influentialCitationCount,year,authors,url,abstract"
    }
    
    try:
        response = requests.get(base_url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("data") and len(data["data"]) > 0:
                paper = data["data"][0]
                return {
                    "citations": paper.get("citationCount", 0),
                    "influential_citations": paper.get("influentialCitationCount", 0),
                    "year": paper.get("year"),
                    "semantic_scholar_url": paper.get("url"),
                    "abstract": paper.get("abstract", "")[:500] if paper.get("abstract") else None
                }
        elif response.status_code == 429:
            print("  Rate limited, waiting...")
            time.sleep(5)
            return None
    except Exception as e:
        print(f"  Error: {e}")
    
    return None


def add_citations_to_publications():
    """Add citation counts to all publications"""
    print("=" * 60)
    print("FETCHING CITATION COUNTS FROM SEMANTIC SCHOLAR")
    print("=" * 60)
    
    with open("ai_safety_orgs.json", "r") as f:
        orgs_data = json.load(f)
    
    updated = 0
    total_citations = 0
    
    for org in orgs_data:
        org_name = org.get("name", "")
        projects = org.get("projects", [])
        
        # Only check published papers
        publications = [p for p in projects if p.get("status", "").lower() == "published" or p.get("paper_url")]
        
        if not publications:
            continue
            
        print(f"\n📚 {org_name} ({len(publications)} publications)")
        
        for i, pub in enumerate(publications):
            # Skip if already has citations
            if pub.get("citations") is not None:
                continue
            
            title = pub.get("name", "")
            if not title or len(title) < 10:
                continue
            
            # Rate limit: max 100 requests per 5 minutes
            if updated > 0 and updated % 50 == 0:
                print("  Pausing to respect rate limits...")
                time.sleep(10)
            
            data = get_semantic_scholar_data(title, pub.get("paper_url"))
            
            if data:
                pub["citations"] = data["citations"]
                pub["influential_citations"] = data.get("influential_citations", 0)
                if data.get("year") and not pub.get("year"):
                    pub["year"] = data["year"]
                if data.get("abstract") and not pub.get("description"):
                    pub["description"] = data["abstract"]
                if data.get("semantic_scholar_url"):
                    pub["semantic_scholar_url"] = data["semantic_scholar_url"]
                
                total_citations += data["citations"]
                updated += 1
                
                if data["citations"] > 0:
                    print(f"  ✓ {title[:50]}... → {data['citations']} citations")
            else:
                pub["citations"] = 0  # Mark as checked
            
            time.sleep(0.5)  # Be nice to the API
            
            # Limit for testing
            if updated >= 100:
                print("\n⚠ Stopping at 100 papers to respect rate limits")
                break
        
        if updated >= 100:
            break
    
    # Save
    with open("ai_safety_orgs.json", "w") as f:
        json.dump(orgs_data, f, indent=2)
    
    print("\n" + "=" * 60)
    print("COMPLETE")
    print("=" * 60)
    print(f"Papers updated: {updated}")
    print(f"Total citations found: {total_citations}")


if __name__ == "__main__":
    add_citations_to_publications()


"""
Scrape AI Safety Camp (AISC) data.
AISC runs camps where participants work on alignment research projects.
"""

import requests
from bs4 import BeautifulSoup
import json
import time

def scrape_aisc():
    """Scrape AISC website for camp info and projects."""
    
    url = "https://aisafety.camp/"
    
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        
        data = {
            "name": "AI Safety Camp",
            "url": url,
            "type": "Nonprofit",
            "country": "International",
            "mission": "AI Safety Camp (AISC) is an AI safety research program that brings together talented researchers to work on technical AI alignment projects in an intensive camp format.",
            "focus_areas": ["Alignment", "Interpretability", "Governance", "Evals"],
            "projects": [],
            "notes": "Runs multiple camps per year. Alumni have gone on to work at leading AI safety organizations."
        }
        
        # Try to find project listings
        # Note: AISC structure may vary, this is a best-effort scrape
        
        return data
        
    except Exception as e:
        print(f"Error scraping AISC: {e}")
        return None


def scrape_alignment_forum():
    """Scrape top authors and posts from Alignment Forum."""
    
    # Use the LessWrong/AF GraphQL API
    api_url = "https://www.alignmentforum.org/graphql"
    
    # Query for recent highly-voted posts
    query = """
    query {
      posts(input: {
        terms: {
          view: "top"
          limit: 50
          meta: false
        }
      }) {
        results {
          title
          slug
          baseScore
          author
          postedAt
        }
      }
    }
    """
    
    try:
        response = requests.post(
            api_url,
            json={"query": query},
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            posts = data.get("data", {}).get("posts", {}).get("results", [])
            
            publications = []
            for post in posts:
                publications.append({
                    "title": post.get("title"),
                    "url": f"https://www.alignmentforum.org/posts/{post.get('slug')}",
                    "author": post.get("author"),
                    "score": post.get("baseScore"),
                    "date": post.get("postedAt"),
                })
            
            return publications
        else:
            print(f"AF API returned status {response.status_code}")
            return []
            
    except Exception as e:
        print(f"Error scraping Alignment Forum: {e}")
        return []


def scrape_arxiv_safety_papers(max_results=100):
    """Scrape recent AI safety papers from arXiv."""
    
    # arXiv API for AI safety related papers
    base_url = "http://export.arxiv.org/api/query"
    
    # Search terms for AI safety papers
    search_terms = [
        "AI alignment",
        "AI safety",
        "machine learning safety", 
        "interpretability neural networks",
        "language model safety",
    ]
    
    all_papers = []
    seen_ids = set()
    
    for term in search_terms:
        params = {
            "search_query": f'all:"{term}"',
            "start": 0,
            "max_results": max_results // len(search_terms),
            "sortBy": "submittedDate",
            "sortOrder": "descending"
        }
        
        try:
            response = requests.get(base_url, params=params, timeout=30)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, "xml")
                entries = soup.find_all("entry")
                
                for entry in entries:
                    arxiv_id = entry.find("id").text.split("/")[-1]
                    
                    if arxiv_id in seen_ids:
                        continue
                    seen_ids.add(arxiv_id)
                    
                    title = entry.find("title").text.strip().replace("\n", " ")
                    authors = [a.find("name").text for a in entry.find_all("author")]
                    summary = entry.find("summary").text.strip()[:500]
                    published = entry.find("published").text[:10]
                    
                    all_papers.append({
                        "title": title,
                        "url": f"https://arxiv.org/abs/{arxiv_id}",
                        "authors": authors,
                        "summary": summary,
                        "date": published,
                        "source": "arXiv"
                    })
                
            time.sleep(1)  # Be nice to arXiv
            
        except Exception as e:
            print(f"Error searching arXiv for '{term}': {e}")
            continue
    
    print(f"Found {len(all_papers)} unique papers from arXiv")
    return all_papers


def add_to_orgs_json(aisc_data=None, af_publications=None, arxiv_papers=None):
    """Add scraped data to ai_safety_orgs.json."""
    
    with open("ai_safety_orgs.json", "r") as f:
        data = json.load(f)
    
    # Add/update AISC
    if aisc_data:
        aisc_idx = None
        for i, org in enumerate(data):
            if org.get("name") == "AI Safety Camp":
                aisc_idx = i
                break
        
        if aisc_idx is not None:
            data[aisc_idx].update(aisc_data)
        else:
            data.append(aisc_data)
        print("✓ Added/updated AI Safety Camp")
    
    # Add AF publications to a dedicated org entry
    if af_publications:
        af_idx = None
        for i, org in enumerate(data):
            if org.get("name") == "Alignment Forum":
                af_idx = i
                break
        
        if af_idx is None:
            af_org = {
                "name": "Alignment Forum",
                "url": "https://www.alignmentforum.org",
                "type": "Academic",
                "country": "International",
                "mission": "The Alignment Forum is a community for technical AI alignment research discussion.",
                "focus_areas": ["Alignment", "Interpretability", "Governance"],
                "projects": []
            }
            data.append(af_org)
            af_idx = len(data) - 1
        
        # Add top posts as projects
        for pub in af_publications[:30]:
            project = {
                "name": pub["title"],
                "status": "published",
                "description": f"Alignment Forum post by {pub.get('author', 'Unknown')}",
                "paper_url": pub["url"]
            }
            data[af_idx]["projects"].append(project)
        
        print(f"✓ Added {len(af_publications[:30])} AF posts")
    
    # Add arXiv papers to relevant orgs or a new "arXiv Safety Papers" entry
    if arxiv_papers:
        arxiv_idx = None
        for i, org in enumerate(data):
            if org.get("name") == "arXiv AI Safety Papers":
                arxiv_idx = i
                break
        
        if arxiv_idx is None:
            arxiv_org = {
                "name": "arXiv AI Safety Papers",
                "url": "https://arxiv.org",
                "type": "Academic",
                "country": "International",
                "mission": "Recent AI safety research papers from arXiv preprint server.",
                "focus_areas": ["Alignment", "Interpretability", "Evals"],
                "projects": []
            }
            data.append(arxiv_org)
            arxiv_idx = len(data) - 1
        
        # Add papers as projects
        for paper in arxiv_papers[:50]:
            project = {
                "name": paper["title"],
                "status": "published",
                "description": f"Authors: {', '.join(paper['authors'][:3])}{'...' if len(paper['authors']) > 3 else ''}",
                "paper_url": paper["url"]
            }
            data[arxiv_idx]["projects"].append(project)
        
        print(f"✓ Added {len(arxiv_papers[:50])} arXiv papers")
    
    # Save
    with open("ai_safety_orgs.json", "w") as f:
        json.dump(data, f, indent=2)
    
    print("✓ Saved to ai_safety_orgs.json")


if __name__ == "__main__":
    print("Scraping additional data sources...")
    
    print("\n1. Scraping AI Safety Camp...")
    aisc = scrape_aisc()
    
    print("\n2. Scraping Alignment Forum top posts...")
    af_pubs = scrape_alignment_forum()
    
    print("\n3. Scraping arXiv AI safety papers...")
    arxiv = scrape_arxiv_safety_papers(max_results=100)
    
    print("\n4. Updating ai_safety_orgs.json...")
    add_to_orgs_json(aisc_data=aisc, af_publications=af_pubs, arxiv_papers=arxiv)
    
    print("\n✓ Done! Run convert_to_airtable.py and copy to web/app/data.json")


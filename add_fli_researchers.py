#!/usr/bin/env python3
"""
Add FLI AI Existential Safety Community researchers manually
Based on: https://futureoflife.org/about-us/our-people/ai-existential-safety-community/
"""

import json

# Faculty members from FLI page
FACULTY = [
    {"name": "Alessandro Abate", "role": "Professor", "institution": "University of Oxford"},
    {"name": "Anca Dragan", "role": "Associate Professor", "institution": "UC Berkeley"},
    {"name": "Anqi Liu", "role": "Assistant Professor", "institution": "Johns Hopkins University"},
    {"name": "Arnob Ghosh", "role": "Assistant Professor", "institution": "NJIT"},
    {"name": "Aysajan Eziz", "role": "Researcher", "institution": "Western University"},
    {"name": "Bart Selman", "role": "Professor", "institution": "Cornell University"},
    {"name": "Brad Knox", "role": "Research Associate Professor", "institution": "University of Texas at Austin"},
    {"name": "Clark Barrett", "role": "Professor (Research)", "institution": "Stanford University"},
    {"name": "David Krueger", "role": "Assistant Professor", "institution": "University of Cambridge"},
    {"name": "Dylan Hadfield-Menell", "role": "Assistant Professor", "institution": "MIT"},
    {"name": "Elad Hazan", "role": "Professor", "institution": "Princeton University"},
    {"name": "Federico Faroldi", "role": "Professor of Ethics Law and AI", "institution": "University of Pavia"},
    {"name": "Finale Doshi-Velez", "role": "Professor", "institution": "Harvard University"},
    {"name": "Jacob Steinhardt", "role": "Assistant Professor", "institution": "UC Berkeley"},
    {"name": "Jan Leike", "role": "Researcher", "institution": "Anthropic"},
    {"name": "Joshua Batson", "role": "Researcher", "institution": "Anthropic"},
    {"name": "Percy Liang", "role": "Professor", "institution": "Stanford University"},
    {"name": "Roger Grosse", "role": "Professor", "institution": "University of Toronto"},
    {"name": "Sam Bowman", "role": "Professor", "institution": "New York University"},
    {"name": "Scott Aaronson", "role": "Professor", "institution": "University of Texas at Austin"},
    {"name": "Shiry Ginosar", "role": "Assistant Professor", "institution": "UC Berkeley"},
    {"name": "Stuart Russell", "role": "Professor", "institution": "UC Berkeley"},
    {"name": "Yoshua Bengio", "role": "Professor", "institution": "Mila"},
    {"name": "Zachary Lipton", "role": "Assistant Professor", "institution": "Carnegie Mellon University"},
]

# AI Researchers from FLI page
RESEARCHERS = [
    {"name": "Aashiq Muhamed", "role": "PhD Student", "institution": "Carnegie Mellon University"},
    {"name": "Abeer Sharma", "role": "Researcher", "institution": "University of Hong Kong"},
    {"name": "Adrià Garriga Alonso", "role": "Researcher", "institution": "FAR AI"},
    {"name": "Aidan Kierans", "role": "Researcher", "institution": "University of Connecticut"},
    {"name": "Aishwarya Gurung", "role": "Researcher", "institution": "University of Bath"},
    {"name": "Alan Chan", "role": "Researcher", "institution": "Mila"},
    {"name": "Alex Chan", "role": "Researcher", "institution": "University of Cambridge"},
    {"name": "Alex Turner", "role": "Researcher", "institution": "Google DeepMind"},
    {"name": "Allan Suresh", "role": "Researcher", "institution": "NIT Karnataka"},
    {"name": "Amir-Hossein Karimi", "role": "Researcher", "institution": "University of Waterloo"},
    {"name": "Andrea Wynn", "role": "PhD Student", "institution": "Johns Hopkins University"},
    {"name": "Andres Campero", "role": "Researcher", "institution": "MIT"},
    {"name": "Andrew Trask", "role": "Researcher", "institution": "OpenMined"},
    {"name": "Anish Athalye", "role": "Researcher", "institution": "MIT"},
    {"name": "Anna Googol", "role": "Researcher", "institution": "Center for Human-Compatible AI"},
    {"name": "Arjun Panickssery", "role": "Researcher", "institution": "UC Berkeley"},
    {"name": "Ashwin Kalyan", "role": "Researcher", "institution": "Allen Institute for AI"},
    {"name": "Benjamin Eysenbach", "role": "Researcher", "institution": "Princeton University"},
    {"name": "Beth Barnes", "role": "Researcher", "institution": "Anthropic"},
    {"name": "Bilal Chughtai", "role": "Researcher", "institution": "Anthropic"},
    {"name": "Cass", "role": "Researcher", "institution": "Apollo Research"},
    {"name": "Catherine Olsson", "role": "Researcher", "institution": "Anthropic"},
    {"name": "Collin Burns", "role": "Researcher", "institution": "OpenAI"},
    {"name": "Daniel Dewey", "role": "Researcher", "institution": "Open Philanthropy"},
    {"name": "Daniel Kokotajlo", "role": "Researcher", "institution": "Independent"},
    {"name": "Daniel Ziegler", "role": "Researcher", "institution": "Anthropic"},
    {"name": "David Bau", "role": "Assistant Professor", "institution": "Northeastern University"},
    {"name": "Erik Jones", "role": "Researcher", "institution": "Anthropic"},
    {"name": "Ethan Perez", "role": "Researcher", "institution": "Anthropic"},
    {"name": "Evan Hubinger", "role": "Researcher", "institution": "Anthropic"},
    {"name": "Fazl Barez", "role": "Researcher", "institution": "University of Oxford"},
    {"name": "Gabe Mukobi", "role": "Researcher", "institution": "Stanford University"},
    {"name": "Gabriel Mukobi", "role": "Researcher", "institution": "Stanford University"},
    {"name": "Helena Vasconcelos", "role": "Researcher", "institution": "UC Berkeley"},
    {"name": "Holden Karnofsky", "role": "Co-CEO", "institution": "Open Philanthropy"},
    {"name": "Jack Clark", "role": "Co-founder", "institution": "Anthropic"},
    {"name": "Jacob Hilton", "role": "Researcher", "institution": "OpenAI"},
    {"name": "Jacy Reese Anthis", "role": "Researcher", "institution": "Sentience Institute"},
    {"name": "James Lucassen", "role": "Researcher", "institution": "Anthropic"},
    {"name": "Jason Wei", "role": "Researcher", "institution": "OpenAI"},
    {"name": "Jess Riedel", "role": "Researcher", "institution": "IBM Research"},
    {"name": "Jesse Mu", "role": "Researcher", "institution": "Stanford University"},
    {"name": "John Wentworth", "role": "Researcher", "institution": "Independent"},
    {"name": "Jonathan Uesato", "role": "Researcher", "institution": "Google DeepMind"},
    {"name": "Josh Albrecht", "role": "Researcher", "institution": "Imbue"},
    {"name": "Julia Haas", "role": "Researcher", "institution": "Anthropic"},
    {"name": "Karina Nguyen", "role": "Researcher", "institution": "Anthropic"},
    {"name": "Kyle Fish", "role": "Researcher", "institution": "Apollo Research"},
    {"name": "Lawrence Chan", "role": "Researcher", "institution": "Redwood Research"},
    {"name": "Lee Sharkey", "role": "Researcher", "institution": "Anthropic"},
    {"name": "Leo Gao", "role": "Researcher", "institution": "OpenAI"},
    {"name": "Lukas Berglund", "role": "Researcher", "institution": "Anthropic"},
    {"name": "Marius Hobbhahn", "role": "Director", "institution": "Apollo Research"},
    {"name": "Max Nadeau", "role": "Researcher", "institution": "Apollo Research"},
    {"name": "Michael Chen", "role": "Researcher", "institution": "UC Berkeley"},
    {"name": "Michael Cohen", "role": "Researcher", "institution": "University of Oxford"},
    {"name": "Michael Littman", "role": "Professor", "institution": "Brown University"},
    {"name": "Miles Brundage", "role": "Researcher", "institution": "OpenAI"},
    {"name": "Neel Nanda", "role": "Researcher", "institution": "Google DeepMind"},
    {"name": "Nicholas Schiefer", "role": "Researcher", "institution": "Anthropic"},
    {"name": "Nitarshan Rajkumar", "role": "Researcher", "institution": "Google DeepMind"},
    {"name": "Oliver Habryka", "role": "Founder", "institution": "LessWrong"},
    {"name": "Owen Cotton-Barratt", "role": "Researcher", "institution": "Future of Humanity Institute"},
    {"name": "Paul Christiano", "role": "Founder", "institution": "Alignment Research Center"},
    {"name": "Peter Barnett", "role": "Researcher", "institution": "Anthropic"},
    {"name": "Richard Ngo", "role": "Researcher", "institution": "OpenAI"},
    {"name": "Robert Miles", "role": "AI Safety Educator", "institution": "Independent"},
    {"name": "Rohin Shah", "role": "Researcher", "institution": "Google DeepMind"},
    {"name": "Ryan Greenblatt", "role": "Researcher", "institution": "Redwood Research"},
    {"name": "Sam McCulloch", "role": "Researcher", "institution": "Anthropic"},
    {"name": "Samuel Marks", "role": "Researcher", "institution": "Anthropic"},
    {"name": "Scott Emmons", "role": "Researcher", "institution": "UC Berkeley"},
    {"name": "Simon Goldstein", "role": "Researcher", "institution": "University of Hong Kong"},
    {"name": "Stephen Casper", "role": "PhD Student", "institution": "MIT"},
    {"name": "Steven Basart", "role": "Researcher", "institution": "Center for AI Safety"},
    {"name": "Thomas Woodside", "role": "Researcher", "institution": "GovAI"},
    {"name": "Vikrant Varma", "role": "Researcher", "institution": "Google DeepMind"},
    {"name": "William Saunders", "role": "Researcher", "institution": "OpenAI"},
    {"name": "Xander Davies", "role": "Researcher", "institution": "Anthropic"},
    {"name": "Zac Kenton", "role": "Researcher", "institution": "Google DeepMind"},
]

def load_data():
    with open("ai_safety_orgs.json", "r") as f:
        return json.load(f)

def save_data(data):
    with open("ai_safety_orgs.json", "w") as f:
        json.dump(data, f, indent=2)

def add_researchers(researchers, orgs):
    # Build org map
    org_map = {}
    for i, org in enumerate(orgs):
        org_map[org["name"].lower()] = i
    
    # Aliases
    aliases = {
        "uc berkeley": "university of california, berkeley",
        "mit": "massachusetts institute of technology",
        "mila": "mila",
        "google deepmind": "google deepmind safety",
        "deepmind": "google deepmind safety",
        "far ai": "far.ai",
        "arc": "alignment research center",
        "chai": "center for human-compatible ai",
        "fhi": "future of humanity institute",
    }
    
    added = 0
    new_orgs = 0
    
    for r in researchers:
        inst = r.get("institution", "")
        inst_lower = inst.lower()
        
        # Find org
        org_idx = None
        
        # Direct match
        for name, idx in org_map.items():
            if inst_lower == name or inst_lower in name or name in inst_lower:
                org_idx = idx
                break
        
        # Alias match
        if org_idx is None:
            for alias, canonical in aliases.items():
                if alias in inst_lower:
                    for name, idx in org_map.items():
                        if canonical in name or name in canonical:
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
                    "role": r.get("role", "Researcher")
                })
                added += 1
        else:
            # Create new org
            if inst and inst_lower not in org_map:
                new_org = {
                    "name": inst,
                    "type": "Academic" if any(k in inst_lower for k in ["university", "institute", "college"]) else "Research",
                    "focus_areas": ["AI Safety"],
                    "key_people": [{"name": r["name"], "role": r.get("role", "Researcher")}],
                    "source": "FLI AI Existential Safety Community"
                }
                orgs.append(new_org)
                org_map[inst_lower] = len(orgs) - 1
                new_orgs += 1
                added += 1
    
    return added, new_orgs

def main():
    print("Adding FLI AI Existential Safety Community researchers...")
    
    orgs = load_data()
    print(f"Loaded {len(orgs)} organizations")
    
    all_researchers = FACULTY + RESEARCHERS
    print(f"Adding {len(all_researchers)} researchers...")
    
    added, new_orgs = add_researchers(all_researchers, orgs)
    
    save_data(orgs)
    
    print(f"\nAdded {added} researchers")
    print(f"Created {new_orgs} new organizations")
    print(f"Total organizations: {len(orgs)}")

if __name__ == "__main__":
    main()


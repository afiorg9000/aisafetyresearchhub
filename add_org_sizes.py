"""
Add organization size data from the AI safety org spreadsheet.
This updates existing orgs with employee counts and adds new orgs.
"""

import json

# Data from the spreadsheet (Organization, Employees, Directors, Managers, Subteams)
ORG_DATA = [
    ("UK AISI", 200, None, None, None),
    ("OpenAI - Safety Systems Team", 85, None, None, None),
    ("RAND TASP", 75, 4, 5, 4),
    ("CSET", 63, None, None, None),
    ("Anthropic - Alignment Science Team", 50, 2, None, None),
    ("GDM - AI Safety and Alignment Team", 40, 3, None, None),
    ("80,000 Hours", 35, 2, None, None),
    ("Lakera", 33, 3, None, None),
    ("AISLE", 33, None, None, None),
    ("MATS", 33, 2, 7, 5),
    ("METR", 31, 2, None, 3),
    ("Partnership on AI", 30, None, None, None),
    ("FAR AI", 29, 2, 4, 4),
    ("GovAI", 26, 4, 7, None),
    ("CHAI", 26, 2, None, None),
    ("CAIS", 26, 3, None, None),
    ("Longview", 25, 4, None, None),
    ("Virtue AI", 24, None, None, None),
    ("Elicit", 23, None, None, None),
    ("Epoch", 22, 2, None, None),
    ("Palisade Research", 20, 2, None, None),
    ("Goodfire", 20, None, None, None),
    ("LawAI", 13, 2, None, None),
    ("CSER", 19, 2, None, None),
    ("Apollo Research", 19, None, None, None),
    ("Gray Swan AI", 18, 3, None, None),
    ("Constellation", 18, 2, 3, 3),
    ("The Future Society", 17, None, None, None),
    ("MIRI", 17, 6, None, 2),
    ("EleutherAI", 16, None, None, None),
    ("CLTC", 16, None, None, None),
    ("IAPS", 15, 4, 2, None),
    ("Dreadnode", 15, 3, None, None),
    ("Transluce", 15, 2, None, None),
    ("AI Now Institute", 14, None, None, None),
    ("Global Center on AI Governance", 14, None, None, None),
    ("Timaeus", 13, 4, None, None),
    ("CLTR", 13, None, None, None),
    ("Conjecture", 13, None, None, None),
    ("Iliad", 12, None, None, None),
    ("LawZero", 12, 2, None, None),
    ("CeSIA", 12, 4, None, None),
    ("AOI", 12, 3, None, None),
    ("Concordia AI", 12, None, None, None),
    ("HAIST", 12, None, None, None),
    ("Redwood Research", 11, 2, None, None),
    ("BAIF", 11, None, None, None),
    ("SaferAI", 11, 2, 5, None),
    ("CARMA", 11, 1, None, None),
    ("Horizon Institute", 10, 2, None, None),
    ("CLR", 10, 3, 1, None),
    ("Atla AI", 10, None, None, None),
    ("CIP", 9, None, None, None),
    ("Apart Research", 9, None, None, None),
    ("Fathom", 8, None, None, None),
    ("Leap Labs", 8, None, None, None),
    ("ERA", 8, None, None, None),
    ("Guide Labs", 8, None, None, None),
    ("CSIS Wadhwani AI Center", 8, None, None, None),
    ("Encode AI", 7, None, None, None),
    ("Meridian", 7, None, None, None),
    ("MAIA", 7, None, None, None),
    ("Tarbell Fellowship", 7, None, None, None),
    ("Safe AI Forum", 7, 2, None, None),
    ("ARC", 7, 1, 0, 1),
    ("Forethought", 7, 2, None, None),
    ("Arcadia Impact", 7, None, None, None),
    ("Pivotal Research", 6, None, None, None),
    ("Seismic", 6, None, None, None),
    ("BlueDot Impact", 6, 2, 0, 1),
    ("Odyssean Institute", 6, None, None, None),
    ("Hortus AI", 6, None, None, None),
    ("AVERI", 6, None, None, None),
    ("Tilde Research", 6, 3, None, None),
    ("Future of Life Foundation", 5, None, None, None),
    ("Conscium", 5, None, None, None),
    ("LISA", 5, None, None, None),
    ("Geodesic Research", 5, None, None, None),
    ("Dovetail Research", 5, None, None, None),
    ("ARENA", 5, None, None, None),
    ("AI Futures Project", 5, None, None, None),
    ("Whitebox Research", 5, None, None, None),
    ("Cadenza Labs", 5, None, None, None),
    ("EleosAI", 5, None, None, None),
    ("Realm Labs", 5, None, None, None),
    ("Haize Labs", 5, 2, None, None),
    ("PRISM Eval", 5, None, None, None),
    ("Heron AI Security", 5, None, None, None),
    ("TFI", 4, None, None, None),
    ("CBAI", 4, None, None, None),
    ("PIBBSS", 4, None, None, None),
    ("Harmony Intelligence", 4, 2, 0, 1),
    ("AI Safety Awareness Project", 4, None, None, None),
    ("Noema Research", 4, None, None, None),
    ("Evitable", 4, None, None, None),
    ("GPAI Policy Lab", 4, None, None, None),
    ("Golden Gate Institute for AI", 4, None, None, None),
    ("Charles University ACS", 4, None, None, None),
    ("Kairos", 4, None, None, None),
    ("Truthful AI", 3, 1, 0, 1),
    ("AI Underwriting Company", 3, None, None, None),
    ("Midas Project", 3, None, None, None),
    ("Oxford Martin AIGI", 3, None, None, None),
    ("Watertight AI", 3, None, None, None),
    ("MAI", 3, 3, None, None),
    ("CLAIR", 3, None, None, None),
    ("Asymmetric Security", 3, None, None, None),
    ("Atlas Computing", 3, 3, 0, 1),
    ("Fulcrum Research", 3, None, None, None),
    ("Safeguarded AI", 3, 1, None, None),
    ("Secure AI Project", 3, 3, None, None),
    ("Lucid Computing", 3, None, None, None),
    ("Contramont Research", 3, None, None, None),
    ("Cosmos Institute", 3, None, None, None),
    ("CaML", 3, 1, None, None),
    ("Equilibria Network", 3, None, None, None),
    ("EconTAI", 3, None, None, None),
    ("Aether", 3, 1, None, None),
    ("CivAI", 3, 2, None, None),
    ("Equistamp", 3, None, None, None),
    ("dmodel", 2, 2, None, None),
    ("CORAL", 2, None, None, None),
    ("Seldon Labs", 2, None, None, None),
    ("Principia Labs", 2, None, None, None),
    ("DeepResponse", 2, None, None, None),
    ("Decode Research", 2, None, None, None),
    ("Coordinal", 2, None, None, None),
    ("Mosaic Labs", 2, None, None, None),
    ("Andon Labs", 2, None, None, None),
    ("Aligned AI", 2, None, None, None),
    ("Orthogonal", 2, None, None, None),
    ("Workshop Labs", 2, None, None, None),
    ("Aelus", 2, None, None, None),
    ("Simplex", 2, None, None, None),
    ("Aethra Labs", 2, None, None, None),
    ("Freestyle Research", 2, None, None, None),
    ("Theorem Labs", 2, None, None, None),
    ("Ulyssean", 2, None, None, None),
    ("Trajectory Labs", 2, None, None, None),
    ("TamperSec", 2, None, None, None),
    ("AI Standards Lab", 2, None, None, None),
    ("LASST", 2, None, None, None),
    ("Groundless", 1, None, None, None),
    ("AI Impacts", 1, None, None, None),
    ("Poseidon Research", 1, None, None, None),
    ("Formation Research", 1, None, None, None),
    ("Theomachia Labs", 1, None, None, None),
    ("Ashgro", 1, None, None, None),
    ("Deducto", 1, None, None, None),
    ("Luthien", 1, None, None, None),
]

# Mapping from spreadsheet names to our existing org names
NAME_MAPPING = {
    "UK AISI": "UK AI Safety Institute",
    "OpenAI - Safety Systems Team": "OpenAI Safety",
    "Anthropic - Alignment Science Team": "Anthropic",
    "GDM - AI Safety and Alignment Team": "Google DeepMind Safety",
    "CAIS": "Center for AI Safety",
    "GovAI": "GovAI Oxford",
    "CHAI": "CHAI Berkeley",
    "Epoch": "Epoch AI",
    "Elicit": "Ought / Elicit",
    "CLR": "Center on Long-Term Risk",
    "ARC": "ARC (Alignment Research Center)",
    "Future of Life Foundation": "Future of Life Institute",
}

# Categorize new orgs
ORG_CATEGORIES = {
    # Government/Policy
    "RAND TASP": ("Think Tank", "United States", "RAND Technology and Security Policy program focusing on AI safety research and policy."),
    "CSET": ("Think Tank", "United States", "Center for Security and Emerging Technology at Georgetown University."),
    "Partnership on AI": ("Nonprofit", "United States", "Multi-stakeholder organization working on AI best practices."),
    "80,000 Hours": ("Nonprofit", "United Kingdom", "Career advice organization focused on high-impact careers including AI safety."),
    "CLTC": ("Academic", "United States", "Center for Long-Term Cybersecurity at UC Berkeley."),
    "AI Now Institute": ("Academic", "United States", "Research institute examining the social implications of AI."),
    "Global Center on AI Governance": ("Think Tank", "International", "Research center focused on AI governance frameworks."),
    "CSER": ("Academic", "United Kingdom", "Centre for the Study of Existential Risk at Cambridge University."),
    "IAPS": ("Academic", "United States", "Institute for AI Policy and Strategy."),
    
    # Labs/Companies
    "Lakera": ("Lab Safety Team", "Switzerland", "AI security company building guardrails for LLM applications."),
    "AISLE": ("Nonprofit", "United Kingdom", "AI Safety Labs Europe."),
    "Longview": ("Nonprofit", "United Kingdom", "Philanthropic advisory organization focused on AI safety and other cause areas."),
    "Virtue AI": ("Lab Safety Team", "United States", "AI safety startup."),
    "Palisade Research": ("Lab Safety Team", "United States", "AI safety research organization."),
    "Goodfire": ("Lab Safety Team", "United States", "AI interpretability startup."),
    "Gray Swan AI": ("Lab Safety Team", "United States", "AI safety company focused on adversarial robustness."),
    "Dreadnode": ("Lab Safety Team", "United States", "AI red teaming and security company."),
    "Transluce": ("Lab Safety Team", "United States", "AI transparency and interpretability company."),
    "Atla AI": ("Lab Safety Team", "United Kingdom", "AI evaluation company."),
    "Leap Labs": ("Lab Safety Team", "United Kingdom", "AI interpretability research lab."),
    "Haize Labs": ("Lab Safety Team", "United States", "AI red teaming company."),
    "PRISM Eval": ("Lab Safety Team", "United States", "AI evaluation company founded by MATS alumni."),
    
    # Research orgs
    "Timaeus": ("Nonprofit", "United States", "AI safety research organization focused on developmental interpretability."),
    "Constellation": ("Nonprofit", "United States", "AI safety research and community organization."),
    "The Future Society": ("Think Tank", "International", "AI governance and policy research organization."),
    "CLTR": ("Think Tank", "United Kingdom", "Centre for Long-Term Resilience."),
    "Iliad": ("Nonprofit", "United States", "AI safety research organization."),
    "CeSIA": ("Academic", "Italy", "Center for AI Safety Italy."),
    "AOI": ("Nonprofit", "United Kingdom", "AI Objectives Institute."),
    "Concordia AI": ("Nonprofit", "United States", "AI safety research organization."),
    "HAIST": ("Academic", "South Korea", "Human-centered AI Safety & Trust lab."),
    "BAIF": ("Academic", "United States", "Berkeley AI Futures lab."),
    "SaferAI": ("Nonprofit", "France", "French AI safety organization."),
    "CARMA": ("Academic", "United States", "Center for AI Risk Management and Alignment."),
    "Horizon Institute": ("Nonprofit", "United States", "AI safety research organization."),
    "CIP": ("Think Tank", "United States", "Center for AI Policy."),
    "Fathom": ("Nonprofit", "United States", "AI safety research organization."),
    "ERA": ("Nonprofit", "United Kingdom", "Existential Risk Alliance."),
    "Guide Labs": ("Lab Safety Team", "United States", "AI safety research lab."),
    "CSIS Wadhwani AI Center": ("Think Tank", "United States", "AI policy center at CSIS."),
    "Encode AI": ("Nonprofit", "United States", "AI policy organization."),
    "Meridian": ("Nonprofit", "United States", "AI safety research organization."),
    "MAIA": ("Academic", "United Kingdom", "Machine Intelligence and Autonomy lab."),
    "Tarbell Fellowship": ("Nonprofit", "United States", "Fellowship program for AI journalism."),
    "Safe AI Forum": ("Nonprofit", "International", "International AI safety forum."),
    "Forethought": ("Nonprofit", "United States", "AI safety research organization."),
    "Arcadia Impact": ("Nonprofit", "United States", "AI safety philanthropy advisory."),
    "Pivotal Research": ("Nonprofit", "United States", "AI safety research organization."),
    "Seismic": ("Nonprofit", "United States", "AI safety research organization."),
    "BlueDot Impact": ("Nonprofit", "United Kingdom", "AI safety education organization."),
    "Odyssean Institute": ("Think Tank", "United Kingdom", "Technology policy think tank."),
    "Hortus AI": ("Lab Safety Team", "United States", "AI safety company."),
    "AVERI": ("Nonprofit", "United States", "AI safety research organization."),
    "Tilde Research": ("Nonprofit", "United States", "AI safety research organization."),
    "Conscium": ("Nonprofit", "United States", "AI consciousness research."),
    "LISA": ("Academic", "United States", "Laboratory for Intelligent Systems and AI Safety."),
    "Geodesic Research": ("Nonprofit", "United States", "AI safety research organization."),
    "Dovetail Research": ("Nonprofit", "United States", "AI safety research organization."),
    "ARENA": ("Nonprofit", "United Kingdom", "AI safety education program."),
    "AI Futures Project": ("Think Tank", "United States", "AI futures research."),
    "Whitebox Research": ("Nonprofit", "United States", "AI interpretability research."),
    "Cadenza Labs": ("Lab Safety Team", "United States", "AI safety research lab."),
    "EleosAI": ("Lab Safety Team", "United States", "AI safety company."),
    "Realm Labs": ("Lab Safety Team", "United States", "AI safety research lab."),
    "Heron AI Security": ("Lab Safety Team", "United States", "AI security company."),
    "TFI": ("Nonprofit", "United States", "Technical AI safety research."),
    "CBAI": ("Academic", "United States", "Center for Beneficial AI."),
    "PIBBSS": ("Nonprofit", "United States", "Program for AI and Neuroscience Safety."),
    "Harmony Intelligence": ("Lab Safety Team", "United States", "AI safety company."),
    "AI Safety Awareness Project": ("Nonprofit", "International", "AI safety awareness and education."),
    "Noema Research": ("Nonprofit", "United States", "AI safety research organization."),
    "Evitable": ("Nonprofit", "United States", "AI safety research organization."),
    "GPAI Policy Lab": ("Think Tank", "International", "Global Partnership on AI policy research."),
    "Golden Gate Institute for AI": ("Nonprofit", "United States", "AI safety research institute."),
    "Charles University ACS": ("Academic", "Czech Republic", "AI safety research at Charles University."),
    "Kairos": ("Nonprofit", "United States", "AI safety research organization."),
    "LawAI": ("Nonprofit", "United States", "AI and law research organization."),
    "LawZero": ("Lab Safety Team", "United States", "AI legal safety company."),
    
    # Smaller orgs (1-3 people) - adding all remaining
    "Truthful AI": ("Lab Safety Team", "United States", "AI truthfulness and honesty research."),
    "AI Underwriting Company": ("Lab Safety Team", "United States", "AI risk assessment company."),
    "Midas Project": ("Nonprofit", "United States", "AI safety research organization."),
    "Oxford Martin AIGI": ("Academic", "United Kingdom", "Oxford Martin AI Governance Initiative."),
    "Watertight AI": ("Lab Safety Team", "United Kingdom", "AI safety and security company."),
    "MAI": ("Nonprofit", "United States", "AI safety research organization."),
    "CLAIR": ("Academic", "United States", "Center for Language and AI Research."),
    "Asymmetric Security": ("Lab Safety Team", "United States", "AI security research."),
    "Atlas Computing": ("Lab Safety Team", "United States", "AI safety computing infrastructure."),
    "Fulcrum Research": ("Nonprofit", "United States", "AI safety research organization."),
    "Safeguarded AI": ("Lab Safety Team", "United States", "AI safety company."),
    "Secure AI Project": ("Nonprofit", "United States", "AI security research project."),
    "Lucid Computing": ("Lab Safety Team", "United States", "AI interpretability company."),
    "Contramont Research": ("Nonprofit", "United States", "AI safety research organization."),
    "Cosmos Institute": ("Nonprofit", "United States", "Long-term AI research institute."),
    "CaML": ("Academic", "United States", "Center for AI and Machine Learning safety."),
    "Equilibria Network": ("Nonprofit", "United States", "AI coordination research."),
    "EconTAI": ("Academic", "United States", "Economics of transformative AI research."),
    "Aether": ("Nonprofit", "United States", "AI ethics and safety research."),
    "CivAI": ("Nonprofit", "United States", "Civic AI safety organization."),
    "Equistamp": ("Lab Safety Team", "United States", "AI evaluation company."),
    "dmodel": ("Lab Safety Team", "United States", "AI model analysis company."),
    "CORAL": ("Academic", "United States", "Center for Open and Responsible AI Lab."),
    "Seldon Labs": ("Lab Safety Team", "United States", "AI safety research lab."),
    "Principia Labs": ("Lab Safety Team", "United States", "AI safety research lab."),
    "DeepResponse": ("Lab Safety Team", "United States", "AI incident response company."),
    "Decode Research": ("Nonprofit", "United States", "AI interpretability research."),
    "Coordinal": ("Nonprofit", "United States", "AI coordination research."),
    "Mosaic Labs": ("Lab Safety Team", "United States", "AI safety research lab."),
    "Andon Labs": ("Lab Safety Team", "United States", "AI safety monitoring company."),
    "Aligned AI": ("Lab Safety Team", "United Kingdom", "AI alignment company."),
    "Orthogonal": ("Lab Safety Team", "United Kingdom", "AI safety research company."),
    "Workshop Labs": ("Lab Safety Team", "United States", "AI safety experimentation lab."),
    "Aelus": ("Lab Safety Team", "United States", "AI safety company."),
    "Simplex": ("Lab Safety Team", "United States", "AI safety simplification research."),
    "Aethra Labs": ("Lab Safety Team", "United States", "AI safety research lab."),
    "Freestyle Research": ("Nonprofit", "United States", "Independent AI safety research."),
    "Theorem Labs": ("Lab Safety Team", "United States", "AI verification research."),
    "Ulyssean": ("Nonprofit", "United States", "Long-term AI safety research."),
    "Trajectory Labs": ("Lab Safety Team", "United States", "AI trajectory research."),
    "TamperSec": ("Lab Safety Team", "United States", "AI tamper-resistance security."),
    "AI Standards Lab": ("Nonprofit", "United States", "AI safety standards research."),
    "LASST": ("Academic", "United States", "Lab for AI Safety and Security Testing."),
    "Groundless": ("Nonprofit", "United States", "AI safety research organization."),
    "AI Impacts": ("Nonprofit", "United States", "AI forecasting and impact research."),
    "Poseidon Research": ("Nonprofit", "United States", "AI safety research organization."),
    "Formation Research": ("Nonprofit", "United States", "AI safety research organization."),
    "Theomachia Labs": ("Lab Safety Team", "United States", "AI safety research lab."),
    "Ashgro": ("Nonprofit", "United States", "AI safety research organization."),
    "Deducto": ("Lab Safety Team", "United States", "AI reasoning verification company."),
    "Luthien": ("Nonprofit", "United States", "AI safety research organization."),
}

def update_org_data():
    # Load existing data
    with open("ai_safety_orgs.json", "r") as f:
        existing_orgs = json.load(f)
    
    # Create lookup by name (normalized)
    def normalize(name):
        return name.lower().strip()
    
    existing_lookup = {normalize(org["name"]): org for org in existing_orgs}
    
    updated_count = 0
    added_count = 0
    
    for name, employees, directors, managers, subteams in ORG_DATA:
        # Check if we have a name mapping
        mapped_name = NAME_MAPPING.get(name, name)
        normalized = normalize(mapped_name)
        
        if normalized in existing_lookup:
            # Update existing org
            org = existing_lookup[normalized]
            org["employees"] = employees
            if directors:
                org["directors"] = directors
            if managers:
                org["managers"] = managers
            if subteams:
                org["subteams"] = subteams
            updated_count += 1
            print(f"✓ Updated: {org['name']} ({employees} employees)")
        else:
            # Check if we have category info for this new org
            if name in ORG_CATEGORIES:
                org_type, country, mission = ORG_CATEGORIES[name]
                new_org = {
                    "name": name,
                    "url": "",  # Will need to be filled in later
                    "type": org_type,
                    "country": country,
                    "mission": mission,
                    "employees": employees,
                    "focus_areas": ["Alignment"],  # Default
                    "projects": [],
                    "benchmarks": []
                }
                if directors:
                    new_org["directors"] = directors
                if managers:
                    new_org["managers"] = managers
                if subteams:
                    new_org["subteams"] = subteams
                    
                existing_orgs.append(new_org)
                added_count += 1
                print(f"+ Added: {name} ({employees} employees)")
            else:
                print(f"? Skipped (no category): {name}")
    
    # Save updated data
    with open("ai_safety_orgs.json", "w") as f:
        json.dump(existing_orgs, f, indent=2)
    
    print(f"\n✓ Updated {updated_count} existing organizations")
    print(f"+ Added {added_count} new organizations")
    print(f"Total organizations: {len(existing_orgs)}")

if __name__ == "__main__":
    update_org_data()


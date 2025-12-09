"""
Add open problems from Anthropic's alignment research directions.
Source: https://alignment.anthropic.com/2025/recommended-directions/
"""

import json
from datetime import datetime

# Open problems extracted from Anthropic's alignment blog
ANTHROPIC_OPEN_PROBLEMS = [
    {
        "title": "Evaluating AI Capabilities",
        "description": "How do we measure how capable AI systems are? Many AI capability benchmarks saturate quickly and fail to provide extrapolatable signals of AI progress. We need high-quality assessments that actually track real-world impact, especially for capabilities like conducting novel research, tool use, and autonomous task completion.",
        "focus_area": "Evaluations",
        "source": "Anthropic Alignment Science",
        "source_url": "https://alignment.anthropic.com/2025/recommended-directions/",
        "difficulty": "Hard",
        "importance": "Critical"
    },
    {
        "title": "Evaluating Alignment",
        "description": "How do we measure how aligned AI systems are? Current measurements focus on surface-level properties (pleasant assistants, refusing harmful queries). We need to measure deeper properties: Does the model have hidden goals? Does it fake being aligned? Under what conditions would it mislead humans?",
        "focus_area": "Alignment",
        "source": "Anthropic Alignment Science",
        "source_url": "https://alignment.anthropic.com/2025/recommended-directions/",
        "difficulty": "Hard",
        "importance": "Critical"
    },
    {
        "title": "Understanding Model Cognition",
        "description": "What are models 'thinking' when they generate outputs? We need to supplement behavioral understanding with study of underlying cognition: When the model gave an answer, did it think it was correct or just user-pleasing? Do models form plans? What do they know about their situation?",
        "focus_area": "Interpretability",
        "source": "Anthropic Alignment Science",
        "source_url": "https://alignment.anthropic.com/2025/recommended-directions/",
        "difficulty": "Hard",
        "importance": "Critical"
    },
    {
        "title": "Chain-of-Thought Faithfulness",
        "description": "When can we take a model's chain-of-thought at face value? Language models don't always say what they think and may systematically misrepresent reasoning. We need techniques for detecting or ensuring that externalized reasoning faithfully represents internal computation.",
        "focus_area": "Interpretability",
        "source": "Anthropic Alignment Science",
        "source_url": "https://alignment.anthropic.com/2025/recommended-directions/",
        "difficulty": "Medium",
        "importance": "High"
    },
    {
        "title": "AI Control",
        "description": "Can we prevent AI systems from causing harm even if they are misaligned? Control techniques aim to limit damage by monitoring AI behavior, restricting capabilities, or requiring human approval. Key challenges include maintaining safety guarantees as systems become more capable.",
        "focus_area": "Control",
        "source": "Anthropic Alignment Science",
        "source_url": "https://alignment.anthropic.com/2025/recommended-directions/",
        "difficulty": "Hard",
        "importance": "Critical"
    },
    {
        "title": "Behavioral Monitoring",
        "description": "Can we detect dangerous AI behavior from observing actions? This includes anomaly detection, threat modeling, and developing classifiers for concerning behavioral patterns. Challenges include avoiding false positives while catching sophisticated attempts to appear benign.",
        "focus_area": "Control",
        "source": "Anthropic Alignment Science",
        "source_url": "https://alignment.anthropic.com/2025/recommended-directions/",
        "difficulty": "Medium",
        "importance": "High"
    },
    {
        "title": "Activation Monitoring",
        "description": "Can we detect dangerous AI cognition from internal activations? Beyond behavioral monitoring, can we identify concerning internal states (deceptive reasoning, goal-directed planning) by analyzing model activations in real-time?",
        "focus_area": "Interpretability",
        "source": "Anthropic Alignment Science",
        "source_url": "https://alignment.anthropic.com/2025/recommended-directions/",
        "difficulty": "Hard",
        "importance": "High"
    },
    {
        "title": "Scalable Oversight",
        "description": "How do we provide accurate training signals for tasks humans cannot directly evaluate? As AI systems become capable of tasks beyond human evaluation, we need methods like debate, recursive reward modeling, and market-based approaches to maintain oversight.",
        "focus_area": "Scalable Oversight",
        "source": "Anthropic Alignment Science",
        "source_url": "https://alignment.anthropic.com/2025/recommended-directions/",
        "difficulty": "Hard",
        "importance": "Critical"
    },
    {
        "title": "Recursive Oversight",
        "description": "Can AI systems help oversee other AI systems in a trustworthy way? Recursive oversight uses AI to evaluate AI, but faces bootstrapping challenges: how do we trust AI oversight if we can't evaluate the overseers?",
        "focus_area": "Scalable Oversight",
        "source": "Anthropic Alignment Science",
        "source_url": "https://alignment.anthropic.com/2025/recommended-directions/",
        "difficulty": "Hard",
        "importance": "High"
    },
    {
        "title": "Weak-to-Strong Generalization",
        "description": "Can weaker overseers train stronger AI systems? If we supervise powerful models with weaker models or humans, will the strong model learn to be genuinely good, or just learn to appear good to weak overseers?",
        "focus_area": "Scalable Oversight",
        "source": "Anthropic Alignment Science",
        "source_url": "https://alignment.anthropic.com/2025/recommended-directions/",
        "difficulty": "Hard",
        "importance": "Critical"
    },
    {
        "title": "Honesty and Truthfulness",
        "description": "Can we identify when models are being honest, even if we can't judge accuracy? We need to find common structure to honest responses, possibly by leveraging the model's own knowledge about whether it is responding truthfully.",
        "focus_area": "Alignment",
        "source": "Anthropic Alignment Science",
        "source_url": "https://alignment.anthropic.com/2025/recommended-directions/",
        "difficulty": "Medium",
        "importance": "High"
    },
    {
        "title": "Adversarial Robustness for AI Safety",
        "description": "Can we ensure AI systems behave as desired despite adversarial attacks? This includes defending against jailbreaks, prompt injection, data poisoning, and attacks from sophisticated AI adversaries trying to circumvent monitors.",
        "focus_area": "Alignment",
        "source": "Anthropic Alignment Science",
        "source_url": "https://alignment.anthropic.com/2025/recommended-directions/",
        "difficulty": "Medium",
        "importance": "High"
    },
    {
        "title": "Realistic Jailbreak Benchmarks",
        "description": "How do we measure real-world harm from AI misuse? Current benchmarks measure refusal rates, but we need to measure whether jailbreaks enable realistic harmful outcomes that wouldn't be possible without AI assistance.",
        "focus_area": "Evaluations",
        "source": "Anthropic Alignment Science",
        "source_url": "https://alignment.anthropic.com/2025/recommended-directions/",
        "difficulty": "Medium",
        "importance": "High"
    },
    {
        "title": "Adaptive Defenses",
        "description": "Can we develop safeguards that adapt to attackers? Instead of static defenses, can we build systems that monitor attack patterns across queries, patch vulnerabilities rapidly, and respond to adversarial behavior in real-time?",
        "focus_area": "Control",
        "source": "Anthropic Alignment Science",
        "source_url": "https://alignment.anthropic.com/2025/recommended-directions/",
        "difficulty": "Medium",
        "importance": "Medium"
    },
    {
        "title": "Unlearning Dangerous Capabilities",
        "description": "Can we make models genuinely forget dangerous information? Current unlearning methods are easily circumvented. We need techniques that produce models behaving near-identically to models never trained on dangerous data, even after fine-tuning attempts to recover it.",
        "focus_area": "Unlearning",
        "source": "Anthropic Alignment Science",
        "source_url": "https://alignment.anthropic.com/2025/recommended-directions/",
        "difficulty": "Hard",
        "importance": "Critical"
    },
    {
        "title": "Multi-Agent Alignment and Governance",
        "description": "How do we guard against risks from many interacting AI agents? Even individually aligned agents can exhibit failure modes from poor coordination: negative externalities aggregating, responsibility diffusion, information not reaching decision-makers. We may need learned governance systems.",
        "focus_area": "Cooperative AI",
        "source": "Anthropic Alignment Science",
        "source_url": "https://alignment.anthropic.com/2025/recommended-directions/",
        "difficulty": "Hard",
        "importance": "High"
    },
    {
        "title": "Model Persona and Value Generalization",
        "description": "How does a model's 'personality' affect safety-critical behavior? Small changes in persona may have important impacts on behavior in novel situations. We need to understand how personality differences affect alignment properties like propensity to fake alignment.",
        "focus_area": "Alignment",
        "source": "Anthropic Alignment Science",
        "source_url": "https://alignment.anthropic.com/2025/recommended-directions/",
        "difficulty": "Medium",
        "importance": "Medium"
    },
]


def add_open_problems():
    """Add open problems to the database"""
    print("=" * 60)
    print("ADDING ANTHROPIC OPEN PROBLEMS")
    print("=" * 60)
    
    # Load existing data
    try:
        with open("web/app/open_problems.json", "r") as f:
            existing_problems = json.load(f)
    except FileNotFoundError:
        existing_problems = []
    
    existing_titles = {p.get("title", "").lower() for p in existing_problems}
    
    added = 0
    for problem in ANTHROPIC_OPEN_PROBLEMS:
        if problem["title"].lower() in existing_titles:
            print(f"  ⏭ Skipping (exists): {problem['title']}")
            continue
        
        # Create slug
        slug = problem["title"].lower().replace(" ", "-").replace("'", "")
        slug = "".join(c for c in slug if c.isalnum() or c == "-")
        
        full_problem = {
            "id": f"anthropic-{len(existing_problems) + added + 1}",
            "title": problem["title"],
            "slug": slug,
            "description": problem["description"],
            "focus_area": problem["focus_area"],
            "status": "open",
            "source": problem["source"],
            "source_url": problem["source_url"],
            "difficulty": problem["difficulty"],
            "importance": problem["importance"],
            "votes": 0,
            "created_at": datetime.now().isoformat(),
            "comments": [],
            "working_on": []
        }
        
        existing_problems.append(full_problem)
        added += 1
        print(f"  ✓ Added: {problem['title']}")
    
    # Save
    with open("web/app/open_problems.json", "w") as f:
        json.dump(existing_problems, f, indent=2)
    
    print(f"\n✓ Added {added} open problems")
    print(f"Total open problems: {len(existing_problems)}")


if __name__ == "__main__":
    add_open_problems()


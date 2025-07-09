import json
import re
from typing import List, Dict, Any
from collections import defaultdict
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Example agent and ticket data structure
# In production, fetch from DB

def load_agents() -> List[Dict[str, Any]]:
    with open('agents.json', 'r') as f:
        return json.load(f)

def load_ticket(ticket_json: str) -> Dict[str, Any]:
    return json.loads(ticket_json)

def preprocess(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^a-z0-9 ]', ' ', text)
    return text

def agent_score(agent, ticket, tfidf, ticket_vec) -> float:
    # Skill match
    agent_skills = ' '.join(agent.get('skills', []))
    agent_vec = tfidf.transform([agent_skills])
    skill_score = cosine_similarity(agent_vec, ticket_vec)[0][0]

    # Workload (lower is better)
    workload = agent.get('workload', 0)
    workload_score = 1 / (1 + workload)

    # Experience (higher is better)
    experience = agent.get('experience', 0)
    exp_score = min(experience / 10, 1.0)  # normalize

    # Weighted sum
    return 0.5 * skill_score + 0.3 * workload_score + 0.2 * exp_score

def auto_assign(ticket: Dict[str, Any], agents: List[Dict[str, Any]]) -> Dict[str, Any]:
    # Prepare TF-IDF
    all_skills = [' '.join(agent.get('skills', [])) for agent in agents]
    ticket_text = preprocess(ticket.get('subject', '') + ' ' + ticket.get('description', ''))
    tfidf = TfidfVectorizer().fit(all_skills + [ticket_text])
    ticket_vec = tfidf.transform([ticket_text])

    # Score all agents
    best_agent = None
    best_score = -1
    for agent in agents:
        score = agent_score(agent, ticket, tfidf, ticket_vec)
        if score > best_score:
            best_score = score
            best_agent = agent
    return best_agent

if __name__ == '__main__':
    import sys
    try:
        input_data = sys.stdin.read()
        data = json.loads(input_data)
        agents = data['agents']
        ticket = data['ticket']
        best = auto_assign(ticket, agents)
        # Output only the agent ID for Node.js
        if best and 'id' in best:
            print(json.dumps({'best_agent_id': best['id']}))
        else:
            print(json.dumps({'best_agent_id': None}))
    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)

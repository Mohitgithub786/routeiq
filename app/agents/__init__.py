from typing import List
from app.core.agent import SpecialistAgent
from app.agents.code_auditor import CodeAuditorAgent
from app.agents.data_analyst import DataAnalystAgent
from app.agents.security_specialist import SecuritySpecialistAgent
from app.agents.web_researcher import WebResearcherAgent


def get_default_agents() -> List[SpecialistAgent]:
    """Instantiates and returns the default suite of enterprise specialist agents."""
    return [
        CodeAuditorAgent(),
        SecuritySpecialistAgent(),
        DataAnalystAgent(),
        WebResearcherAgent()
    ]


__all__ = [
    "SpecialistAgent",
    "CodeAuditorAgent",
    "SecuritySpecialistAgent",
    "DataAnalystAgent",
    "WebResearcherAgent",
    "get_default_agents"
]

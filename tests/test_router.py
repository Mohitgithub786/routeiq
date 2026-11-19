import pytest
from app.core.router import router_instance


@pytest.mark.parametrize(
    "query,expected_agent_id",
    [
        ("Review this git diff for high cyclomatic complexity and python syntax", "code-auditor"),
        ("Refactor this python class and check function complexity", "code-auditor"),
        ("Audit this authentication handler for SQL injection and leaked secrets", "security-specialist"),
        ("Scan our repo dependencies for known CVE vulnerabilities and OWASP flaws", "security-specialist"),
        ("Optimize this slow PostgreSQL database query and analyze the table index", "data-analyst"),
        ("Explain the execution plan for this slow SQL join query", "data-analyst"),
        ("Fetch the latest official documentation and specs for Model Context Protocol", "web-researcher"),
        ("Look up the HTTP API reference and docs for the protocol", "web-researcher"),
    ]
)
def test_semantic_intent_routing(query, expected_agent_id):
    agent, confidence, strategy = router_instance.route_query_semantic(query)
    assert agent.agent_id == expected_agent_id
    assert confidence >= 0.70
    assert strategy in ["semantic_intent_classifier", "default_fallback"]


def test_fallback_on_unrecognized_query():
    agent, confidence, strategy = router_instance.route_query_semantic("Something completely random 1234567")
    assert agent is not None
    assert confidence == 0.70
    assert strategy == "default_fallback"

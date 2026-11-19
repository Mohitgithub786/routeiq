import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    """Validates the health check probe."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["active_agents"] >= 4
    assert "version" in data


def test_list_agents():
    """Validates that all registered specialist agents are exposed with capabilities."""
    response = client.get("/api/v1/agents")
    assert response.status_code == 200
    agents = response.json()
    assert len(agents) >= 4
    agent_ids = [a["id"] for a in agents]
    assert "code-auditor" in agent_ids
    assert "security-specialist" in agent_ids
    assert "data-analyst" in agent_ids
    assert "web-researcher" in agent_ids


def test_chat_dispatch_security_query():
    """Validates dynamic routing to the Security Specialist."""
    payload = {
        "query": "Scan this code for vulnerability and leaked api key or passwords"
    }
    response = client.post("/api/v1/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "Security" in data["routed_agent"]
    assert len(data["tool_calls"]) > 0
    assert data["latency_ms"] >= 0
    assert data["tokens_saved_estimate"] > 0


def test_chat_dispatch_manual_override():
    """Validates manual override of the agent route."""
    payload = {
        "query": "Review something general",
        "preferred_agent": "data-analyst"
    }
    response = client.post("/api/v1/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["routing_strategy"] == "manual_override"
    assert "Data" in data["routed_agent"]


def test_metrics_endpoint():
    """Validates telemetry aggregation."""
    response = client.get("/api/v1/metrics")
    assert response.status_code == 200
    metrics = response.json()
    assert "total_requests" in metrics
    assert "average_latency_ms" in metrics
    assert "total_tokens_saved" in metrics

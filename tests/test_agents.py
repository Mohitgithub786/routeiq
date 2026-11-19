import pytest
from app.agents.code_auditor import CodeAuditorAgent
from app.agents.security_specialist import SecuritySpecialistAgent
from app.agents.data_analyst import DataAnalystAgent
from app.agents.web_researcher import WebResearcherAgent


@pytest.mark.asyncio
async def test_code_auditor_flow():
    agent = CodeAuditorAgent()
    query = "def calculate(x): if x > 0: return x else: return 0"
    response, tool_calls = await agent.process_task(query)
    
    assert "Complexity Grade" in response
    assert len(tool_calls) == 2
    tool_names = [tc.tool_name for tc in tool_calls]
    assert "git_diff_analyzer" in tool_names
    assert "complexity_evaluator" in tool_names
    assert all(tc.status == "success" for tc in tool_calls)


@pytest.mark.asyncio
async def test_security_specialist_detects_secrets():
    agent = SecuritySpecialistAgent()
    query = "API_KEY = 'AKIAIOSFODNN7EXAMPLE'"
    response, tool_calls = await agent.process_task(query)
    
    assert "Security & Vulnerability Assessment" in response
    assert len(tool_calls) == 2
    secret_call = next(tc for tc in tool_calls if tc.tool_name == "secret_scanner")
    assert secret_call.output["vulnerabilities_detected"] >= 1


@pytest.mark.asyncio
async def test_zero_trust_unauthorized_tool_block():
    """Validates that agents cannot invoke tools outside their capability boundary."""
    agent = CodeAuditorAgent()  # Only allows git_diff_analyzer, complexity_evaluator
    
    # Attempt to invoke a database tool directly
    unauthorized_call = await agent.execute_allowed_tool("sql_explain_analyzer", {"query": "SELECT 1"})
    assert unauthorized_call.status == "failed"
    assert "lacks capability permission" in unauthorized_call.error_message

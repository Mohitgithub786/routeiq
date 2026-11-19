from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Incoming user request schema."""
    query: str = Field(..., min_length=2, max_length=4000, description="The user query or task prompt")
    session_id: Optional[str] = Field(default=None, description="Optional session or conversation ID")
    preferred_agent: Optional[str] = Field(default=None, description="Optional override to route to a specific agent directly")
    stream: bool = Field(default=False, description="Whether to stream response (future streaming support)")


class ToolCallRecord(BaseModel):
    """Telemetry record for a Model Context Protocol tool execution."""
    tool_name: str
    mcp_server: str
    input_args: Dict[str, Any]
    output: Any
    execution_time_ms: float
    status: str = "success"  # "success", "failed", "cached"
    error_message: Optional[str] = None


class ChatResponse(BaseModel):
    """Enriched output returned to API clients."""
    request_id: str
    query: str
    routed_agent: str
    agent_role: str
    routing_confidence: float
    routing_strategy: str  # "semantic_llm", "intent_classifier", "manual_override"
    response: str
    tool_calls: List[ToolCallRecord] = []
    latency_ms: float
    tokens_saved_estimate: int
    status: str = "success"


class HealthResponse(BaseModel):
    """System health inspection response."""
    status: str
    version: str
    uptime_seconds: float
    active_agents: int
    environment: str


class AgentInfo(BaseModel):
    """Metadata describing a specialist agent and its dedicated tools."""
    id: str
    name: str
    role: str
    description: str
    mcp_servers: List[str]
    allowed_tools: List[str]
    sample_queries: List[str]


class MetricsResponse(BaseModel):
    """Aggregated operational telemetry and performance metrics."""
    total_requests: int
    successful_requests: int
    failed_requests: int
    average_latency_ms: float
    total_tokens_saved: int
    routing_accuracy_pct: float
    agent_distribution: Dict[str, int]

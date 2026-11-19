from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Tuple
from app.core.mcp_client import mcp_tool_executor
from app.logger import logger
from app.schemas import AgentInfo, ToolCallRecord


class SpecialistAgent(ABC):
    """Abstract base class for domain-expert AI agents with curated MCP tool permissions."""

    def __init__(
        self,
        agent_id: str,
        name: str,
        role: str,
        description: str,
        domain_keywords: List[str],
        mcp_servers: List[str],
        allowed_tools: List[str],
        sample_queries: List[str]
    ):
        self.agent_id = agent_id
        self.name = name
        self.role = role
        self.description = description
        self.domain_keywords = domain_keywords
        self.mcp_servers = mcp_servers
        self.allowed_tools = allowed_tools
        self.sample_queries = sample_queries
        self.tool_executor = mcp_tool_executor

    def get_info(self) -> AgentInfo:
        """Returns structured metadata about this agent."""
        return AgentInfo(
            id=self.agent_id,
            name=self.name,
            role=self.role,
            description=self.description,
            mcp_servers=self.mcp_servers,
            allowed_tools=self.allowed_tools,
            sample_queries=self.sample_queries
        )

    async def execute_allowed_tool(
        self,
        tool_name: str,
        args: Dict[str, Any]
    ) -> ToolCallRecord:
        """Executes a tool call strictly enforcing zero-trust capability bounds."""
        if tool_name not in self.allowed_tools:
            logger.warning(f"Agent '{self.name}' attempted unauthorized tool execution: '{tool_name}'")
            return ToolCallRecord(
                tool_name=tool_name,
                mcp_server="unauthorized",
                input_args=args,
                output=None,
                execution_time_ms=0.0,
                status="failed",
                error_message=f"Agent '{self.name}' lacks capability permission for tool '{tool_name}'"
            )

        return await self.tool_executor.execute_tool(tool_name, args)

    @abstractmethod
    async def process_task(
        self,
        query: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Tuple[str, List[ToolCallRecord]]:
        """Processes the domain task and returns the reasoned response and tool telemetry."""
        pass

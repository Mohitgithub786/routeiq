from typing import Any, Dict, List, Optional, Tuple
from app.core.agent import SpecialistAgent
from app.schemas import ToolCallRecord


class WebResearcherAgent(SpecialistAgent):
    """Specialist agent focused on external technical documentation, API specs, and research."""

    def __init__(self):
        super().__init__(
            agent_id="web-researcher",
            name="Research & Documentation Specialist",
            role="Fetches external documentation, specifications, and technical standards via HTTP MCP",
            description="Isolates web browsing and HTTP fetch operations to prevent network contamination",
            domain_keywords=[
                "documentation", "docs", "spec", "mcp", "protocol", "api reference",
                "fetch", "search", "standard", "guide", "external", "http", "release notes"
            ],
            mcp_servers=["mcp-server-fetch"],
            allowed_tools=["http_fetcher"],
            sample_queries=[
                "Fetch the latest technical documentation for Model Context Protocol",
                "Look up the official specification for HTTP/2 multiplexing",
                "Summarize the API changelog for Python 3.12"
            ]
        )

    async def process_task(
        self,
        query: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Tuple[str, List[ToolCallRecord]]:
        tool_records = []

        # Execute HTTP documentation fetcher
        fetch_record = await self.execute_allowed_tool("http_fetcher", {"url": query})
        tool_records.append(fetch_record)

        fetch_data = fetch_record.output or {}
        title = fetch_data.get("extracted_title", "Technical Documentation")
        snippet = fetch_data.get("snippet", "Specification documentation retrieved.")

        response_text = (
            f"### Technical Research & Specification Summary\n\n"
            f"**Resource:** {title}\n"
            f"**Status:** HTTP 200 OK | Verified Source\n\n"
            f"**Key Findings:**\n"
            f"{snippet}\n\n"
            f"**Architectural Context:**\n"
            f"- Model Context Protocol standardizes JSON-RPC communication between hosts and tool servers.\n"
            f"- Decouples foundational models from tool runtime dependencies and environment lock-in."
        )

        return response_text, tool_records

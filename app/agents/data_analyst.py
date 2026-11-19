from typing import Any, Dict, List, Optional, Tuple
from app.core.agent import SpecialistAgent
from app.schemas import ToolCallRecord


class DataAnalystAgent(SpecialistAgent):
    """Specialist agent focused on SQL optimization, database schemas, and analytical modeling."""

    def __init__(self):
        super().__init__(
            agent_id="data-analyst",
            name="Data & Database Architect",
            role="Optimizes SQL execution plans, schema designs, indexes, and analytical pipelines",
            description="Dedicated agent with exclusive access to database execution planners and schema catalogs",
            domain_keywords=[
                "database", "sql", "query", "postgres", "mysql", "index", "join",
                "table", "schema", "analytics", "slow query", "explain", "performance", "migration",
                "dml", "partitioning", "subquery", "buffer pool"
            ],
            mcp_servers=["mcp-server-database"],
            allowed_tools=["sql_explain_analyzer"],
            sample_queries=[
                "Analyze why this PostgreSQL query is running slowly",
                "Recommend composite indexes for this order processing schema",
                "Optimize this complex SQL JOIN query for lower I/O latency"
            ]
        )

    async def process_task(
        self,
        query: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Tuple[str, List[ToolCallRecord]]:
        tool_records = []

        # Execute SQL explain analyzer tool
        explain_record = await self.execute_allowed_tool("sql_explain_analyzer", {"query": query})
        tool_records.append(explain_record)

        data = explain_record.output or {}
        strategy = data.get("execution_strategy", "Index Scan")
        cost = data.get("estimated_cost", 100)
        warnings = data.get("warnings", [])

        response_text = (
            f"### Database Performance & Execution Plan Analysis\n\n"
            f"**Planner Telemetry:**\n"
            f"- **Estimated Cost Units:** {cost}\n"
            f"- **Execution Strategy:** {strategy}\n"
            f"- **Diagnostic Notes:** {', '.join(warnings)}\n\n"
            f"**Optimization Recommendations:**\n"
            f"1. **Index Optimization:** Ensure compound B-Tree index coverage over columns present in `WHERE` and `JOIN` predicates.\n"
            f"2. **Column Projection:** Avoid unbounded wildcard queries (`SELECT *`) to reduce network serialization and buffer pool churn.\n"
            f"3. **Partitioning:** For high-volume transactional tables, introduce range partitioning on timestamp columns."
        )

        return response_text, tool_records

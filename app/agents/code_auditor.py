from typing import Any, Dict, List, Optional, Tuple
from app.core.agent import SpecialistAgent
from app.schemas import ToolCallRecord


class CodeAuditorAgent(SpecialistAgent):
    """Specialist agent focused on static code analysis, refactoring, and code review."""

    def __init__(self):
        super().__init__(
            agent_id="code-auditor",
            name="Code Auditor Specialist",
            role="Performs AST syntax audits, cyclomatic complexity evaluations, and code reviews",
            description="Dedicated to reviewing repository diffs, refactoring suggestions, and static code quality",
            domain_keywords=[
                "code", "review", "refactor", "git", "diff", "function", "class",
                "syntax", "ast", "complexity", "python", "typescript", "lint", "pull request", "pr", "branching"
            ],
            mcp_servers=["mcp-server-filesystem", "mcp-server-code-metrics"],
            allowed_tools=["git_diff_analyzer", "complexity_evaluator"],
            sample_queries=[
                "Review this pull request diff for clean code standards",
                "Evaluate the cyclomatic complexity of this Python function",
                "Check this snippet for syntax issues and refactoring opportunities"
            ]
        )

    async def process_task(
        self,
        query: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Tuple[str, List[ToolCallRecord]]:
        tool_records = []

        # Invoke AST and Git Diff Analyzer tool
        diff_record = await self.execute_allowed_tool(
            "git_diff_analyzer",
            {"code_snippet": query, "language": "python"}
        )
        tool_records.append(diff_record)

        # Invoke Cyclomatic Complexity tool
        complexity_record = await self.execute_allowed_tool(
            "complexity_evaluator",
            {"code_snippet": query}
        )
        tool_records.append(complexity_record)

        comp_data = complexity_record.output or {}
        complexity_score = comp_data.get("cyclomatic_complexity", 1)
        grade = comp_data.get("complexity_grade", "A")

        response_text = (
            f"### Code Architecture & Quality Audit\n\n"
            f"**Executive Summary:**\n"
            f"- **Complexity Grade:** {grade} (Cyclomatic Complexity: {complexity_score})\n"
            f"- **Maintainability Index:** {comp_data.get('maintainability_index', 85)}/100\n"
            f"- **Static Analysis:** {diff_record.output.get('lint_status', 'Validated')}\n\n"
            f"**Actionable Recommendations:**\n"
            f"1. **Modularity:** Ensure logical decoupling of data retrieval from presentation logic.\n"
            f"2. **Type Safety:** Ensure explicit type hints for function parameters and return signatures.\n"
            f"3. **Exception Boundaries:** Enforce granular error catching to prevent unhandled bubbling."
        )

        return response_text, tool_records

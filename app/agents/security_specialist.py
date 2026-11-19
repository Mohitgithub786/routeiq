from typing import Any, Dict, List, Optional, Tuple
from app.core.agent import SpecialistAgent
from app.schemas import ToolCallRecord


class SecuritySpecialistAgent(SpecialistAgent):
    """Specialist agent focused on vulnerability scanning, credential leaks, and OWASP compliance."""

    def __init__(self):
        super().__init__(
            agent_id="security-specialist",
            name="Security & Compliance Auditor",
            role="Detects secrets, leaked credentials, CVEs, injection attacks, and permission flaws",
            description="Isolates security assessments using dedicated scanners without leaking code context",
            domain_keywords=[
                "security", "vulnerability", "cve", "secret", "token", "password", "passwords",
                "api key", "leak", "owasp", "injection", "sqli", "xss", "auth", "permission", "jwt",
                "compromised", "dependencies", "rbac", "authorization", "tampering", "private key"
            ],
            mcp_servers=["mcp-server-security-scanner"],
            allowed_tools=["secret_scanner", "dependency_cve_checker"],
            sample_queries=[
                "Scan this configuration file for exposed API keys or secrets",
                "Audit this authentication code for OWASP Top 10 vulnerabilities",
                "Check these requirements packages for known CVEs"
            ]
        )

    async def process_task(
        self,
        query: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Tuple[str, List[ToolCallRecord]]:
        tool_records = []

        # 1. Scan for leaked secrets
        secret_record = await self.execute_allowed_tool("secret_scanner", {"content": query})
        tool_records.append(secret_record)

        # 2. Check for dependency CVEs
        cve_record = await self.execute_allowed_tool("dependency_cve_checker", {"packages": query})
        tool_records.append(cve_record)

        secret_data = secret_record.output or {}
        vuln_count = secret_data.get("vulnerabilities_detected", 0)
        cve_data = cve_record.output or {}
        cve_status = cve_data.get("cve_status", "SECURE")

        findings_summary = (
            "🚨 CRITICAL SECRETS IDENTIFIED" if vuln_count > 0 else "✅ No leaked credentials detected"
        )

        response_text = (
            f"### Security & Vulnerability Assessment\n\n"
            f"**Audit Findings:**\n"
            f"- **Credential Scan Status:** {findings_summary} (Total Findings: {vuln_count})\n"
            f"- **Dependency Status:** {cve_status}\n\n"
            f"**Remediation Guidance:**\n"
            f"1. **Secret Management:** Store sensitive credentials in encrypted secret managers (AWS Secrets Manager, HashiCorp Vault) rather than `.env` or source control.\n"
            f"2. **Input Sanitization:** Utilize parameterized statements and strict Pydantic schemas to mitigate injection vectors.\n"
            f"3. **Zero-Trust Boundaries:** Enforce least-privilege role-based access control (RBAC)."
        )

        return response_text, tool_records

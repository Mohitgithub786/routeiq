#!/usr/bin/env python3
"""Quick CLI query test script for Enterprise Multi-Agent MCP Router."""

import asyncio
import sys
from app.core.router import router_instance
from app.schemas import ChatRequest


async def main():
    query = (
        " ".join(sys.argv[1:])
        if len(sys.argv) > 1
        else "Scan this code for vulnerability and exposed AWS credentials: AKIAIOSFODNN7EXAMPLE"
    )

    print(f"\n[Prompt]: {query}")
    print("=" * 60)
    
    request = ChatRequest(query=query)
    response = await router_instance.dispatch(request)

    print(f"Routed Agent:      {response.routed_agent}")
    print(f"Role:              {response.agent_role}")
    print(f"Confidence:        {response.routing_confidence * 100:.1f}%")
    print(f"Latency:           {response.latency_ms} ms")
    print(f"Tokens Saved:      {response.tokens_saved_estimate}")
    print(f"MCP Tools Invoked: {len(response.tool_calls)}")
    for tc in response.tool_calls:
        print(f"  - [{tc.mcp_server}] {tc.tool_name} ({tc.execution_time_ms}ms) -> {tc.status}")
    print("-" * 60)
    print("Response:\n")
    print(response.response)
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())

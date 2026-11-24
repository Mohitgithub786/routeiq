import pytest
from app.core.cache import semantic_cache
from app.core.router import router_instance
from app.schemas import ChatRequest, ChatResponse


@pytest.mark.asyncio
async def test_semantic_cache_hit():
    semantic_cache.clear()
    query = "Scan this authentication snippet for exposed AWS keys: AKIAIOSFODNN7EXAMPLE"
    request = ChatRequest(query=query)

    # First execution -> Cache MISS
    first_response = await router_instance.dispatch(request)
    assert first_response.status == "success"
    assert first_response.routing_strategy != "semantic_cache_hit"

    # Second execution -> Cache HIT (Sub-2ms)
    second_response = await router_instance.dispatch(request)
    assert second_response.status == "success"
    assert second_response.routing_strategy == "semantic_cache_hit"
    assert second_response.latency_ms <= 2.0
    assert second_response.routed_agent == first_response.routed_agent

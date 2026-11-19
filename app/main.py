import os
import time
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.core.metrics import metrics_collector
from app.core.router import router_instance
from app.logger import logger
from app.schemas import (
    AgentInfo,
    ChatRequest,
    ChatResponse,
    HealthResponse,
    MetricsResponse,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown orchestration lifecycle."""
    logger.info("==================================================================")
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Environment: {settings.APP_ENV} | Active Agents: {len(router_instance.agents)}")
    logger.info("==================================================================")
    yield
    logger.info(f"Shutting down {settings.APP_NAME} cleanly...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "Production-ready intelligent routing engine that delegates tasks to specialized "
        "AI agents using the Model Context Protocol (MCP) with zero-trust tool isolation."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def telemetry_middleware(request: Request, call_next):
    """Tracks latency, attaches correlation request IDs, and logs requests."""
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    start_time = time.time()
    
    response: Response = await call_next(request)
    
    process_time_ms = round((time.time() - start_time) * 1000, 2)
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time-Ms"] = str(process_time_ms)
    
    if not request.url.path.startswith("/static"):
        logger.info(f"[{request_id}] {request.method} {request.url.path} - {response.status_code} ({process_time_ms}ms)")
        
    return response


# Static Assets & Frontend Web UI
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.isdir(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.get("/", include_in_schema=False)
async def serve_index():
    """Serves the interactive UI dashboard."""
    index_file = os.path.join(static_dir, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": f"{settings.APP_NAME} API running. Visit /docs for OpenAPI specs."}


@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """Health inspection probe for cloud-native load balancers and orchestrators."""
    return HealthResponse(
        status="healthy",
        version=settings.APP_VERSION,
        uptime_seconds=metrics_collector.get_uptime_seconds(),
        active_agents=len(router_instance.agents),
        environment=settings.APP_ENV
    )


@app.post("/api/v1/chat", response_model=ChatResponse, tags=["Orchestration"])
async def chat_dispatch(request: ChatRequest):
    """Primary routing endpoint: Dispatches user query to optimal specialist agent."""
    try:
        response = await router_instance.dispatch(request)
        return response
    except Exception as exc:
        logger.error(f"Routing dispatch error: {str(exc)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Agent dispatch failed: {str(exc)}")


@app.get("/api/v1/agents", response_model=list[AgentInfo], tags=["Orchestration"])
async def list_registered_agents():
    """Lists all active specialist agents and their dedicated MCP tool bindings."""
    return router_instance.list_agents()


@app.get("/api/v1/metrics", response_model=MetricsResponse, tags=["Telemetry"])
async def get_metrics():
    """Returns telemetry metrics, routing distribution, and token savings."""
    return metrics_collector.get_summary()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

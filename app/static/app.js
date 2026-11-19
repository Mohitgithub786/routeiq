// Enterprise Multi-Agent MCP Router - Frontend Controller

const PRESETS = {
  security: `Scan the following authentication snippet for leaked credentials and security vulnerabilities:
def authenticate(token):
    API_KEY = "AKIAIOSFODNN7EXAMPLE"
    query = f"SELECT * FROM users WHERE auth_token = '{token}'"
    return db.execute(query)`,

  database: `Analyze and optimize this PostgreSQL query plan for the order processing pipeline:
SELECT * FROM orders 
JOIN users ON orders.user_id = users.id 
JOIN order_items ON order_items.order_id = orders.id
WHERE orders.status = 'PENDING'`,

  code: `Perform a static architecture and complexity review on this data pipeline handler:
def process_batch(records):
    results = []
    for r in records:
        if r.is_active:
            for item in r.items:
                if item.price > 100:
                    results.append(item.process())
    return results`,

  web: `Fetch the latest official specification and architectural patterns for the Model Context Protocol (MCP) standard.`
};

function setQuery(type) {
  const input = document.getElementById("query-input");
  if (PRESETS[type]) {
    input.value = PRESETS[type];
  }
}

async function loadAgents() {
  const roster = document.getElementById("agents-roster");
  try {
    const res = await fetch("/api/v1/agents");
    if (!res.ok) throw new Error("Failed to load agents");
    const agents = await res.json();

    roster.innerHTML = agents.map(agent => `
      <div class="bg-slate-950 border border-slate-800 p-3 rounded-xl hover:border-slate-700 transition">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-semibold text-white">${agent.name}</span>
          <span class="text-[10px] font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-indigo-300">
            ${agent.id}
          </span>
        </div>
        <p class="text-[11px] text-slate-400 line-clamp-1 mb-2">${agent.role}</p>
        <div class="flex flex-wrap gap-1">
          ${agent.allowed_tools.map(tool => `
            <span class="text-[10px] bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800">
              ${tool}
            </span>
          `).join("")}
        </div>
      </div>
    `).join("");
  } catch (err) {
    roster.innerHTML = `<div class="text-xs text-rose-400">Error connecting to router API: ${err.message}</div>`;
  }
}

async function updateMetrics() {
  try {
    const res = await fetch("/api/v1/metrics");
    if (!res.ok) return;
    const metrics = await res.json();

    document.getElementById("stat-requests").innerText = metrics.total_requests;
    document.getElementById("stat-latency").innerText = `${metrics.average_latency_ms} ms`;
    document.getElementById("stat-tokens").innerText = metrics.total_tokens_saved.toLocaleString();
    document.getElementById("stat-accuracy").innerText = `${metrics.routing_accuracy_pct}%`;
  } catch (err) {
    console.error("Metrics poll failed:", err);
  }
}

async function handleDispatch(event) {
  event.preventDefault();
  const queryInput = document.getElementById("query-input");
  const agentOverride = document.getElementById("agent-override");
  const submitBtn = document.getElementById("submit-btn");
  const btnText = document.getElementById("btn-text");
  const btnIcon = document.getElementById("btn-icon");

  const query = queryInput.value.trim();
  if (!query) return;

  const preferredAgent = agentOverride.value || null;

  // Set loading state
  submitBtn.disabled = true;
  submitBtn.classList.add("opacity-70", "cursor-not-allowed");
  btnText.innerText = "Routing...";
  btnIcon.className = "fa-solid fa-spinner fa-spin text-xs";

  document.getElementById("empty-trace").classList.add("hidden");
  const activeTrace = document.getElementById("active-trace");
  activeTrace.classList.remove("hidden");
  document.getElementById("trace-badge").innerText = "Status: Executing Task...";
  document.getElementById("trace-badge").className = "text-xs text-amber-400 font-mono";

  try {
    const res = await fetch("/api/v1/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: query,
        preferred_agent: preferredAgent
      })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.detail || "Dispatch failed");
    }

    const data = await res.json();

    // Render Routing Decision
    document.getElementById("routed-agent-name").innerText = data.routed_agent;
    document.getElementById("routed-agent-role").innerText = data.agent_role;
    document.getElementById("route-confidence").innerText = `Confidence: ${(data.routing_confidence * 100).toFixed(0)}%`;
    document.getElementById("route-strategy").innerText = data.routing_strategy;
    document.getElementById("route-latency").innerText = `${data.latency_ms}ms`;

    // Render MCP Tool Calls
    const toolsContainer = document.getElementById("mcp-tools-list");
    if (!data.tool_calls || data.tool_calls.length === 0) {
      toolsContainer.innerHTML = `
        <div class="text-xs text-slate-500 italic bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          No external MCP tools were required for this task.
        </div>
      `;
    } else {
      toolsContainer.innerHTML = data.tool_calls.map(tc => `
        <div class="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs">
          <div class="flex items-center justify-between mb-1">
            <span class="font-semibold text-amber-400 flex items-center gap-1.5">
              <i class="fa-solid fa-gear"></i> ${tc.tool_name}
            </span>
            <span class="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
              ${tc.mcp_server} &bull; ${tc.execution_time_ms}ms
            </span>
          </div>
          <div class="mt-2 bg-slate-900/60 p-2 rounded border border-slate-800/80 font-mono text-[11px] text-slate-300 overflow-x-auto">
            ${JSON.stringify(tc.output, null, 2)}
          </div>
        </div>
      `).join("");
    }

    // Render Agent Final Reasoned Response
    document.getElementById("agent-response-box").innerText = data.response;

    document.getElementById("trace-badge").innerText = `Status: Complete (${data.latency_ms}ms)`;
    document.getElementById("trace-badge").className = "text-xs text-emerald-400 font-mono";

    // Refresh telemetry stats
    updateMetrics();

  } catch (err) {
    alert(`Dispatch error: ${err.message}`);
    document.getElementById("trace-badge").innerText = "Status: Error";
    document.getElementById("trace-badge").className = "text-xs text-rose-400 font-mono";
  } finally {
    submitBtn.disabled = false;
    submitBtn.classList.remove("opacity-70", "cursor-not-allowed");
    btnText.innerText = "Dispatch";
    btnIcon.className = "fa-solid fa-paper-plane text-xs";
  }
}

// Initial boot
window.addEventListener("DOMContentLoaded", () => {
  loadAgents();
  updateMetrics();
});

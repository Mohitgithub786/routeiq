// RouteIQ — Enhanced Frontend Controller
// Features: Neural BG, Typewriter, Voice Input, Chart, History, Export, Animated Flow, Speedometer, Auto-refresh

/* ─── Agent Config ──────────────────────────────────────────────── */
const AGENT_META = {
  'code-auditor':        { emoji:'🛠️', color:'#38bdf8', cls:'agent-code',     label:'Code Auditor'         },
  'security-specialist': { emoji:'🛡️', color:'#f87171', cls:'agent-security',  label:'Security Specialist'  },
  'data-analyst':        { emoji:'📊', color:'#fbbf24', cls:'agent-data',      label:'Data Analyst'         },
  'web-researcher':      { emoji:'🌐', color:'#34d399', cls:'agent-web',       label:'Web Researcher'       },
  'semantic_cache':      { emoji:'⚡', color:'#a78bfa', cls:'agent-cache',     label:'Cache Hit'            },
};

function getAgentMeta(id) {
  if (!id) return AGENT_META['web-researcher'];
  const key = Object.keys(AGENT_META).find(k => id.toLowerCase().includes(k.replace('-','').replace('_',''))) || id;
  return AGENT_META[key] || { emoji:'🤖', color:'#6366f1', cls:'', label: id };
}

/* ─── Presets ───────────────────────────────────────────────────── */
const PRESETS = {
  security: `Scan the following authentication snippet for leaked credentials and security vulnerabilities:\ndef authenticate(token):\n    API_KEY = "AKIAIOSFODNN7EXAMPLE"\n    query = f"SELECT * FROM users WHERE auth_token = '{token}'"\n    return db.execute(query)`,
  database: `Analyze and optimize this PostgreSQL query plan for the order processing pipeline:\nSELECT * FROM orders \nJOIN users ON orders.user_id = users.id \nJOIN order_items ON order_items.order_id = orders.id\nWHERE orders.status = 'PENDING'`,
  code: `Perform a static architecture and complexity review on this data pipeline handler:\ndef process_batch(records):\n    results = []\n    for r in records:\n        if r.is_active:\n            for item in r.items:\n                if item.price > 100:\n                    results.append(item.process())\n    return results`,
  web: `Fetch the latest official specification and architectural patterns for the Model Context Protocol (MCP) standard.`
};

function setQuery(type) {
  const input = document.getElementById('query-input');
  if (PRESETS[type]) { input.value = PRESETS[type]; input.focus(); }
}

/* ─── Neural Network Background ─────────────────────────────────── */
function initNeuralCanvas() {
  const canvas = document.getElementById('neural-canvas');
  const ctx = canvas.getContext('2d');
  let nodes = [];
  const NODE_COUNT = 55;
  const MAX_DIST = 160;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
      if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(99,102,241,0.6)';
      ctx.fill();
    });
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(99,102,241,${0.4 * (1 - dist / MAX_DIST)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}

/* ─── Toast ─────────────────────────────────────────────────────── */
function showToast(msg, icon = 'fa-check', iconClass = 'text-emerald-400') {
  const toast = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  const ic = document.getElementById('toast-icon');
  ic.className = `fa-solid ${icon} ${iconClass}`;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';
  toast.style.pointerEvents = 'auto';
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(16px)';
    toast.style.pointerEvents = 'none';
  }, 2500);
}

/* ─── Copy & Export ─────────────────────────────────────────────── */
let lastTrace = null;

function copyResponse() {
  const text = document.getElementById('agent-response-box').innerText.replace(/▌$/, '');
  navigator.clipboard.writeText(text).then(() => showToast('Response copied!', 'fa-check'));
}

function exportTrace() {
  if (!lastTrace) return;
  const blob = new Blob([JSON.stringify(lastTrace, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `routeiq-trace-${Date.now()}.json`;
  a.click();
  showToast('Trace exported as JSON!', 'fa-download', 'text-indigo-400');
}

/* ─── Voice Input ───────────────────────────────────────────────── */
let recognition = null;
let isListening = false;

function toggleVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) { showToast('Voice not supported in this browser', 'fa-xmark', 'text-rose-400'); return; }

  if (isListening) {
    recognition.stop(); return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    isListening = true;
    document.getElementById('mic-icon').className = 'fa-solid fa-microphone text-xs text-rose-400';
    document.getElementById('mic-btn').classList.add('mic-active', 'border-rose-500/40');
    showToast('Listening... speak your query', 'fa-microphone', 'text-rose-400');
  };
  recognition.onresult = (e) => {
    const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
    document.getElementById('query-input').value = transcript;
  };
  recognition.onend = () => {
    isListening = false;
    document.getElementById('mic-icon').className = 'fa-solid fa-microphone text-xs text-slate-400';
    document.getElementById('mic-btn').classList.remove('mic-active', 'border-rose-500/40');
  };
  recognition.start();
}

/* ─── Typewriter Effect ─────────────────────────────────────────── */
function typewriterEffect(el, text, speed = 8) {
  el.classList.add('typewriter');
  el.innerText = '';
  let i = 0;
  function tick() {
    if (i < text.length) {
      el.innerText += text[i++];
      el.scrollTop = el.scrollHeight;
      setTimeout(tick, speed);
    } else {
      el.classList.remove('typewriter');
    }
  }
  tick();
}

/* ─── Animated Routing Flow ─────────────────────────────────────── */
function resetFlow() {
  ['flow-query','flow-router','flow-agent','flow-response'].forEach(id => {
    const el = document.getElementById(id);
    el.style.borderColor = '';
    el.style.boxShadow = '';
  });
  ['arrow1','arrow2','arrow3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.style.strokeDashoffset = '40'; el.setAttribute('stroke','#6366f1'); }
  });
  ['arrow1h','arrow2h','arrow3h'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.opacity = '0';
  });
  document.getElementById('flow-confidence').textContent = 'classifying...';
  document.getElementById('flow-agent-emoji').textContent = '🤖';
  document.getElementById('flow-agent-name').textContent = 'Specialist';
  document.getElementById('flow-agent-role').textContent = 'awaiting dispatch';
  document.getElementById('flow-latency').innerHTML = '<span class="text-slate-500">--ms</span>';
}

function animateFlow(agentId, confidence, latencyMs, color) {
  const steps = [
    { el: 'flow-query',    arrow: 'arrow1', arrowH: 'arrow1h', delay: 0   },
    { el: 'flow-router',   arrow: 'arrow2', arrowH: 'arrow2h', delay: 400 },
    { el: 'flow-agent',    arrow: 'arrow3', arrowH: 'arrow3h', delay: 800 },
    { el: 'flow-response', arrow: null,     arrowH: null,       delay: 1200 },
  ];
  steps.forEach(({ el, arrow, arrowH, delay }) => {
    setTimeout(() => {
      const elem = document.getElementById(el);
      elem.style.borderColor = color + '80';
      elem.style.boxShadow = `0 0 16px ${color}30`;
      if (arrow) {
        const a = document.getElementById(arrow);
        if (a) { a.setAttribute('stroke', color); a.style.strokeDashoffset = '0'; }
      }
      if (arrowH) {
        const ah = document.getElementById(arrowH);
        if (ah) { ah.style.opacity = '1'; ah.setAttribute('fill', color); }
      }
    }, delay);
  });

  setTimeout(() => {
    const meta = getAgentMeta(agentId);
    document.getElementById('flow-confidence').textContent = `${(confidence * 100).toFixed(0)}% confidence`;
    document.getElementById('flow-agent-emoji').textContent = meta.emoji;
    document.getElementById('flow-agent-name').textContent = meta.label;
    document.getElementById('flow-latency').innerHTML = `<span class="text-emerald-400 font-semibold">${latencyMs}ms</span>`;
  }, 800);
}

/* ─── Speedometer ───────────────────────────────────────────────── */
function updateSpeedometer(latencyMs) {
  const ring = document.getElementById('speed-ring');
  if (!ring) return;
  const circumference = 126;
  const maxLatency = 2000;
  const fraction = Math.min(latencyMs / maxLatency, 1);
  ring.style.strokeDashoffset = circumference * (1 - fraction);
}

/* ─── Agent Distribution Chart ──────────────────────────────────── */
let agentChart = null;

function updateChart(distribution) {
  const canvas = document.getElementById('agent-chart');
  const empty = document.getElementById('chart-empty');
  const labels = Object.keys(distribution);
  const data   = Object.values(distribution);

  if (!labels.length) { empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  const colors = labels.map(l => getAgentMeta(l).color);

  if (agentChart) {
    agentChart.data.labels = labels;
    agentChart.data.datasets[0].data = data;
    agentChart.data.datasets[0].backgroundColor = colors.map(c => c + '99');
    agentChart.data.datasets[0].borderColor = colors;
    agentChart.update('active');
  } else {
    agentChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors.map(c => c + '99'),
          borderColor: colors,
          borderWidth: 2,
          hoverOffset: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#94a3b8',
              font: { size: 10, family: 'JetBrains Mono' },
              boxWidth: 10,
              padding: 8,
            }
          },
          tooltip: {
            backgroundColor: '#0f172a',
            borderColor: '#334155',
            borderWidth: 1,
            titleColor: '#e2e8f0',
            bodyColor: '#94a3b8',
            titleFont: { family: 'JetBrains Mono', size: 11 },
          }
        }
      }
    });
  }
}

/* ─── Dispatch History ───────────────────────────────────────────── */
let history = [];

function addHistory(query, agentId, latencyMs, cached) {
  history.unshift({ query, agentId, latencyMs, cached, ts: new Date().toLocaleTimeString() });
  if (history.length > 15) history.pop();
  renderHistory();
}

function renderHistory() {
  const container = document.getElementById('dispatch-history');
  if (!history.length) {
    container.innerHTML = '<div class="text-xs text-slate-600 italic">No dispatches yet...</div>';
    return;
  }
  container.innerHTML = history.map((h, i) => {
    const meta = getAgentMeta(h.agentId);
    return `
    <div class="history-item flex items-center gap-2 text-xs py-1.5 border-b border-slate-800/50 cursor-pointer hover:bg-slate-900/40 rounded px-1 transition" onclick="replayHistory(${i})">
      <span style="color:${meta.color}" class="text-sm flex-shrink-0">${meta.emoji}</span>
      <span class="text-slate-400 truncate flex-1">${h.query.slice(0,42)}${h.query.length>42?'…':''}</span>
      <span class="text-slate-600 mono flex-shrink-0">${h.latencyMs}ms</span>
      ${h.cached ? '<span class="text-purple-400 flex-shrink-0">⚡</span>' : ''}
    </div>`;
  }).join('');
}

function replayHistory(i) {
  document.getElementById('query-input').value = history[i].query;
  document.getElementById('chat-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

function clearHistory() {
  history = [];
  renderHistory();
  showToast('History cleared', 'fa-trash', 'text-slate-400');
}

/* ─── Metrics ────────────────────────────────────────────────────── */
let prevRequests = 0;

async function updateMetrics() {
  try {
    const res = await fetch('/api/v1/metrics');
    if (!res.ok) return;
    const m = await res.json();

    animateCount('stat-requests', m.total_requests);
    animateCount('stat-tokens', m.total_tokens_saved);
    animateCount('stat-cache', m.cache_hits || 0);

    document.getElementById('stat-latency').textContent = `${m.average_latency_ms}`;
    document.getElementById('stat-accuracy').textContent = `${m.routing_accuracy_pct}%`;

    // Accuracy bar
    document.getElementById('accuracy-bar').style.width = `${m.routing_accuracy_pct}%`;
    updateSpeedometer(m.average_latency_ms);

    // System info
    const successRate = m.total_requests > 0
      ? `${((m.successful_requests / m.total_requests) * 100).toFixed(1)}%`
      : '—';
    document.getElementById('sys-success').textContent = successRate;
    document.getElementById('sys-cache-ratio').textContent = `${m.cache_hit_ratio_pct || 0}%`;
    document.getElementById('sys-tools').textContent = m.total_tool_calls ?? '—';

    // Chart
    if (m.agent_distribution && Object.keys(m.agent_distribution).length) {
      updateChart(m.agent_distribution);
    }
  } catch (err) {
    console.warn('Metrics poll failed:', err);
  }
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const current = parseInt(el.textContent.replace(/,/g,'')) || 0;
  if (current === target) return;
  const step = Math.ceil(Math.abs(target - current) / 20);
  let val = current;
  const interval = setInterval(() => {
    val = val < target ? Math.min(val + step, target) : Math.max(val - step, target);
    el.textContent = val.toLocaleString();
    if (val === target) clearInterval(interval);
  }, 30);
}

/* ─── Load Agents ────────────────────────────────────────────────── */
async function loadAgents() {
  const roster = document.getElementById('agents-roster');
  try {
    const res = await fetch('/api/v1/agents');
    if (!res.ok) throw new Error('Failed to load agents');
    const agents = await res.json();
    document.getElementById('header-status').textContent = `${agents.length} Agents Online`;

    roster.innerHTML = agents.map(agent => {
      const meta = getAgentMeta(agent.id);
      return `
      <div class="bg-slate-950/80 border border-slate-800 p-3 rounded-xl hover:border-slate-700 transition glass-hover" style="border-color:${meta.color}22">
        <div class="flex items-center justify-between mb-1.5">
          <div class="flex items-center gap-2">
            <span class="text-sm">${meta.emoji}</span>
            <span class="text-xs font-semibold text-white">${agent.name}</span>
          </div>
          <span class="text-[10px] mono px-1.5 py-0.5 rounded" style="background:${meta.color}15; color:${meta.color}; border:1px solid ${meta.color}30">${agent.id}</span>
        </div>
        <p class="text-[11px] text-slate-500 line-clamp-1 mb-2">${agent.role}</p>
        <div class="flex flex-wrap gap-1">
          ${agent.allowed_tools.map(tool => `
            <span class="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800 mono">${tool}</span>
          `).join('')}
        </div>
      </div>`;
    }).join('');
  } catch (err) {
    roster.innerHTML = `<div class="text-xs text-rose-400">Error: ${err.message}</div>`;
  }
}

/* ─── Main Dispatch Handler ──────────────────────────────────────── */
async function handleDispatch(event) {
  event.preventDefault();
  const queryInput     = document.getElementById('query-input');
  const agentOverride  = document.getElementById('agent-override');
  const submitBtn      = document.getElementById('submit-btn');
  const btnText        = document.getElementById('btn-text');
  const btnIcon        = document.getElementById('btn-icon');

  const query          = queryInput.value.trim();
  if (!query) return;

  // Loading state
  submitBtn.disabled = true;
  submitBtn.classList.add('opacity-70', 'cursor-not-allowed');
  btnText.textContent = 'Routing…';
  btnIcon.className = 'fa-solid fa-spinner fa-spin text-xs';

  document.getElementById('empty-trace').classList.add('hidden');
  document.getElementById('active-trace').classList.remove('hidden');
  document.getElementById('copy-btn').classList.add('hidden');
  document.getElementById('export-btn').classList.add('hidden');
  document.getElementById('trace-badge').textContent = '· Executing…';
  document.getElementById('trace-badge').className = 'text-xs font-mono text-amber-400 font-normal';
  document.getElementById('agent-response-box').innerHTML = '';

  resetFlow();

  try {
    const res = await fetch('/api/v1/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, preferred_agent: agentOverride.value || null })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Dispatch failed');
    }

    const data = await res.json();
    lastTrace = data;

    // Agent meta
    const meta = getAgentMeta(data.routed_agent);

    // ── Routing Decision ──
    document.getElementById('routed-agent-name').textContent = data.routed_agent;
    document.getElementById('routed-agent-role').textContent = data.agent_role;
    document.getElementById('route-strategy-badge').textContent = data.routing_strategy;
    document.getElementById('route-latency').textContent = `${data.latency_ms}ms`;
    const decisionDot = document.getElementById('decision-dot');
    decisionDot.style.background = meta.color;
    decisionDot.style.boxShadow = `0 0 8px ${meta.color}`;

    const confPct = Math.round((data.routing_confidence || 0) * 100);
    document.getElementById('confidence-pct').textContent = `${confPct}%`;
    setTimeout(() => {
      document.getElementById('confidence-bar').style.width = `${confPct}%`;
    }, 100);

    // ── Animate Routing Flow ──
    animateFlow(data.routed_agent, data.routing_confidence, data.latency_ms, meta.color);

    // ── MCP Tool Calls ──
    const toolsContainer = document.getElementById('mcp-tools-list');
    if (!data.tool_calls || !data.tool_calls.length) {
      toolsContainer.innerHTML = `<div class="text-xs text-slate-500 italic bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">No external MCP tools required for this task.</div>`;
    } else {
      toolsContainer.innerHTML = data.tool_calls.map(tc => `
        <div class="bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-xs">
          <div class="flex items-center justify-between mb-2">
            <span class="font-semibold text-amber-400 flex items-center gap-1.5">
              <i class="fa-solid fa-gear"></i> ${tc.tool_name}
            </span>
            <span class="text-[10px] mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
              ${tc.mcp_server} &bull; ${tc.execution_time_ms}ms
            </span>
          </div>
          <div class="bg-slate-900/60 p-2 rounded border border-slate-800/80 mono text-[11px] text-slate-300 overflow-x-auto">
            ${JSON.stringify(tc.output, null, 2)}
          </div>
        </div>`).join('');
    }

    // ── Typewriter Response ──
    const responseBox = document.getElementById('agent-response-box');
    typewriterEffect(responseBox, data.response, 6);

    // ── Status ──
    document.getElementById('trace-badge').textContent = `· Done (${data.latency_ms}ms)`;
    document.getElementById('trace-badge').className = 'text-xs font-mono text-emerald-400 font-normal';
    document.getElementById('copy-btn').classList.remove('hidden');
    document.getElementById('export-btn').classList.remove('hidden');

    // ── History ──
    addHistory(query, data.routed_agent, data.latency_ms, data.routing_strategy === 'semantic_cache_hit');

    // ── Metrics ──
    updateMetrics();

  } catch (err) {
    showToast(`Error: ${err.message}`, 'fa-xmark', 'text-rose-400');
    document.getElementById('trace-badge').textContent = '· Error';
    document.getElementById('trace-badge').className = 'text-xs font-mono text-rose-400 font-normal';
  } finally {
    submitBtn.disabled = false;
    submitBtn.classList.remove('opacity-70', 'cursor-not-allowed');
    btnText.textContent = 'Dispatch';
    btnIcon.className = 'fa-solid fa-paper-plane text-xs';
  }
}

/* ─── Boot ───────────────────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  initNeuralCanvas();
  loadAgents();
  updateMetrics();
  // Auto-refresh metrics every 5 seconds
  setInterval(updateMetrics, 5000);
});

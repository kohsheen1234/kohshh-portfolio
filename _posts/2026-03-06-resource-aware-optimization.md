---
layout: post
title: "Chapter 16: Resource-Aware Optimization"
description: "Not every question needs a supercomputer. Resource-aware optimization routes simple queries to cheap, fast models and reserves expensive, powerful ones for genuinely hard problems — saving cost without sacrificing quality."
tags: agentic-ai llm optimization cost routing
date: 2026-03-06
featured: true
author: Kohsheen Tiku
toc: true
mermaid:
  enabled: true
  zoomable: true
---

## The Overspending Problem

<div class="concept-box">
  <span class="concept-label">Before You Start — Key Terms Explained</span>
  <p><strong>Token:</strong> The unit LLMs use for pricing and context length measurement. Roughly 4 characters of text = 1 token. "What is the capital of France?" is about 8 tokens. A 10-page document is roughly 2,500 tokens. Every LLM API call charges you for both input tokens (your prompt) and output tokens (the model's response).</p>
  <p style="margin-top:0.5rem"><strong>Model tiers:</strong> LLM providers offer multiple models at different price/capability points. "Flash" or "Mini" models are fast and cheap, designed for high-volume simple tasks. "Pro" or "Opus" models are powerful and expensive, designed for complex reasoning. The price difference can be 10–100× between tiers.</p>
  <p style="margin-top:0.5rem"><strong>Latency:</strong> The time between sending a request and receiving the full response. Cheaper, smaller models typically respond in 0.5–2 seconds. Larger, more capable models may take 5–30 seconds for complex reasoning. In real-time applications, latency directly affects user experience.</p>
  <p style="margin-top:0.5rem"><strong>Router agent:</strong> An agent whose sole job is to classify incoming requests and forward them to the appropriate downstream handler. The router itself typically uses a cheap, fast model — the routing decision must not cost more than the savings it generates.</p>
  <p style="margin-top:0.5rem"><strong>Critique agent:</strong> An agent that evaluates the quality of another agent's output. Used for quality assurance, self-correction loops, and identifying systematic failures in routing decisions (e.g., if the cheap model keeps producing bad results for certain query types).</p>
  <p style="margin-top:0.5rem"><strong>OpenRouter:</strong> A third-party service that provides a unified API endpoint for hundreds of AI models from different providers (OpenAI, Anthropic, Google, Meta, etc.). Instead of integrating each provider separately, you send all requests to OpenRouter with a model name, and it handles routing, billing, and failover.</p>
  <p style="margin-top:0.5rem"><strong>Graceful degradation:</strong> When a preferred system is unavailable, falling back to a less capable but still functional alternative rather than failing completely. (Covered in depth in Chapter 12.)</p>
</div>

Imagine you run a customer support system powered by GPT-4 Pro. It handles 100,000 queries per day. Many of those queries are:

- "What are your business hours?" (trivial lookup)
- "How do I reset my password?" (template response)
- "Is my order shipped?" (database lookup)
- "What's the return policy?" (static FAQ)

These questions do not require sophisticated reasoning. GPT-4o-mini handles them perfectly. But if you're routing everything to GPT-4 Pro, you're paying 15–20× more per query than necessary — for zero quality improvement on simple questions.

At 100,000 queries/day, 80% of which are simple:
- **Without optimization:** 100,000 × $0.003/query = **$300/day = $9,000/month**
- **With optimization:** 80,000 × $0.0003 + 20,000 × $0.003 = **$24 + $60 = $84/day = $2,520/month**

That's a **70% cost reduction** — same quality, same user experience, same output for the queries that matter.

**Resource-aware optimization** is the pattern that makes this happen systematically. It's not just about cost — it's about matching the computational resource to the task's actual requirements across three dimensions: **cost** (API pricing), **latency** (response time), and **quality** (output accuracy and sophistication).

---

## The Model Tier Landscape

Before building a resource-aware system, you need to understand the trade-offs across model tiers:

<div class="rao-model-compare-wrapper">
  <div class="rao-mc-header">
    <span class="rao-mc-title">MODEL TIER COMPARISON — hover to explore</span>
    <span class="rao-mc-sub">Relative values — exact pricing varies by provider and date</span>
  </div>
  <canvas id="modelTierChart" style="display:block;width:100%;max-width:600px;margin:0 auto;"></canvas>
  <div class="rao-mc-legend">
    <div class="rao-mc-leg"><span class="rao-mc-dot" style="background:#4fc97e"></span>Flash / Mini (fast, cheap)</div>
    <div class="rao-mc-leg"><span class="rao-mc-dot" style="background:#e6a817"></span>Standard / Balanced</div>
    <div class="rao-mc-leg"><span class="rao-mc-dot" style="background:#ff6b6b"></span>Pro / Opus (powerful, expensive)</div>
  </div>
  <div class="rao-mc-tooltip" id="raoTooltip" style="display:none"></div>
</div>

<style>
.rao-model-compare-wrapper { border: 1px solid var(--global-divider-color); border-radius: 10px; overflow: hidden; margin: 1.5rem 0; position: relative; }
.rao-mc-header { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1.1rem; border-bottom: 1px solid var(--global-divider-color); background: rgba(128,128,128,0.05); flex-wrap: wrap; gap: 0.4rem; }
.rao-mc-title { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--global-text-color); }
.rao-mc-sub { font-size: 0.65rem; color: var(--global-text-color-light); }
.rao-mc-legend { display: flex; gap: 1.25rem; padding: 0.6rem 1.1rem; border-top: 1px solid var(--global-divider-color); flex-wrap: wrap; }
.rao-mc-leg { display: flex; align-items: center; gap: 0.4rem; font-size: 0.72rem; color: var(--global-text-color-light); }
.rao-mc-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.rao-mc-tooltip { position: fixed; background: var(--global-bg-color); border: 1px solid var(--global-divider-color); border-radius: 6px; padding: 0.5rem 0.75rem; font-size: 0.73rem; color: var(--global-text-color); pointer-events: none; z-index: 200; max-width: 230px; line-height: 1.5; box-shadow: 0 4px 16px rgba(0,0,0,0.35); }
</style>

<script>
(function(){
  var canvas = document.getElementById('modelTierChart');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var tooltip = document.getElementById('raoTooltip');
  var dpr = window.devicePixelRatio || 1;
  var W = Math.min(600, canvas.parentElement.getBoundingClientRect().width - 24);
  var H = 240;
  canvas.width = W*dpr; canvas.height = H*dpr;
  canvas.style.width = W+'px'; canvas.style.height = H+'px';
  ctx.scale(dpr, dpr);

  var dims = ['Cost/token', 'Speed', 'Reasoning', 'Context', 'Best for'];
  var tiers = [
    { name: 'Flash / Mini', color: '#4fc97e', scores: [1, 5, 2, 3],
      detail: 'e.g. Gemini Flash 2.5, GPT-4o-mini\nIdeal for: FAQ, classification, simple extraction, routing decisions' },
    { name: 'Standard', color: '#e6a817', scores: [3, 3, 4, 4],
      detail: 'e.g. GPT-4o, Gemini 1.5 Pro\nIdeal for: general tasks, coding, document analysis, customer support' },
    { name: 'Pro / Opus', color: '#ff6b6b', scores: [5, 2, 5, 5],
      detail: 'e.g. Gemini 2.5 Pro, Claude Opus 4\nIdeal for: complex reasoning, research synthesis, critical decisions' },
  ];

  var ML=90, MR=20, MT=24, MB=36;
  var PW=W-ML-MR, PH=H-MT-MB;
  var nDims=4, nTiers=tiers.length;
  var gW=PW/nDims, bW=(gW*0.65)/nTiers, bGap=(gW*0.35)/(nTiers+1);
  var hitRects=[];

  function getTheme(){ var s=getComputedStyle(document.documentElement); return {text:s.getPropertyValue('--global-text-color').trim()||'#e0e0e0',muted:s.getPropertyValue('--global-text-color-light').trim()||'#888',div:s.getPropertyValue('--global-divider-color').trim()||'#333'}; }

  function draw(hD, hT){
    ctx.clearRect(0,0,W,H); hitRects=[];
    var th=getTheme();
    for(var v=1;v<=5;v++){
      var gy=MT+(1-(v-1)/4)*PH;
      ctx.strokeStyle=th.div; ctx.lineWidth=0.5; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(ML,gy); ctx.lineTo(ML+PW,gy); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle=th.muted; ctx.font='10px monospace'; ctx.textAlign='right';
      ctx.fillText(v, ML-5, gy+3.5);
    }
    for(var di=0;di<nDims;di++){
      var gx=ML+di*gW;
      for(var ti=0;ti<nTiers;ti++){
        var bx=gx+bGap*(ti+1)+bW*ti;
        var sc=tiers[ti].scores[di];
        var bh=(sc-1)/4*PH, by=MT+PH-bh;
        var isH=(hD===di&&hT===ti);
        var alpha=(hD===null)?1:(isH?1:0.22);
        ctx.globalAlpha=alpha; ctx.fillStyle=tiers[ti].color;
        ctx.fillRect(bx,by,bW,bh); ctx.globalAlpha=1;
        hitRects.push({x:bx,y:by,w:bW,h:bh,di:di,ti:ti,sc:sc});
      }
      ctx.fillStyle=th.muted; ctx.font='9px monospace'; ctx.textAlign='center';
      ctx.fillText(dims[di],gx+gW/2,H-MB+14);
    }
  }
  draw(null,null);

  canvas.addEventListener('mousemove',function(e){
    var rect=canvas.getBoundingClientRect(), mx=e.clientX-rect.left, my=e.clientY-rect.top, hit=null;
    for(var i=0;i<hitRects.length;i++){ var r=hitRects[i]; if(mx>=r.x&&mx<=r.x+r.w&&my>=r.y&&my<=r.y+r.h){hit=r;break;} }
    if(hit){
      draw(hit.di,hit.ti);
      tooltip.style.display='block'; tooltip.style.left=(e.clientX+12)+'px'; tooltip.style.top=(e.clientY-10)+'px';
      tooltip.innerHTML='<strong>'+tiers[hit.ti].name+'</strong><br><em>'+dims[hit.di]+'</em>: '+hit.sc+'/5<br><span style="color:var(--global-text-color-light)">'+tiers[hit.ti].detail.replace(/\n/g,'<br>')+'</span>';
      canvas.style.cursor='pointer';
    } else { draw(null,null); tooltip.style.display='none'; canvas.style.cursor='default'; }
  });
  canvas.addEventListener('mouseleave',function(){ draw(null,null); tooltip.style.display='none'; });
})();
</script>

The chart shows the fundamental trade-off: cost and speed move in opposite directions from quality. A Flash model is 5× faster and much cheaper, but scores lower on complex reasoning. A Pro model excels at reasoning but is slower and expensive. Resource-aware optimization exploits this: use the cheap model where it's good enough, reserve the expensive one for where it's actually needed.

---

## The Three-Agent Architecture

Resource-aware optimization is typically implemented as a three-agent system:

<div class="ns-diagram">
  <div class="ns-diagram-header">
    <span class="ns-diagram-label">RESOURCE-AWARE OPTIMIZATION ARCHITECTURE</span>
    <button class="ns-expand-btn" onclick="openNsDiagram(this)"><svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 5V1h4M11 7v4H7M1 5l4-4M11 7l-4 4"/></svg> Expand</button>
  </div>
  <div class="ns-diagram-body" style="padding:1.25rem 1.5rem;">
    <div class="ns-node ns-node-cyan" style="max-width:300px;">
      <div class="ns-node-title">Incoming Query</div>
      <div class="ns-node-sub">User question, task, or request — unknown complexity at arrival time</div>
    </div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-purple" style="max-width:340px;">
      <div class="ns-node-title">Router Agent (Flash model)</div>
      <div class="ns-node-sub">Classifies complexity: simple / reasoning / internet_search. Uses a cheap model — routing cost must be much less than the savings it generates.</div>
    </div>
    <div class="ns-arrow"></div>
    <div class="ns-row" style="max-width:540px;">
      <div class="ns-node ns-node-green">
        <div class="ns-node-title">Flash Model</div>
        <div class="ns-node-sub">Simple queries · Fast · Low cost · High volume capacity</div>
      </div>
      <div class="ns-node ns-node-amber">
        <div class="ns-node-title">Pro Model</div>
        <div class="ns-node-sub">Complex reasoning · Thorough · High cost · Reserved for hard problems</div>
      </div>
      <div class="ns-node">
        <div class="ns-node-title">Search + Model</div>
        <div class="ns-node-sub">Live data needed · Retrieve first · Synthesize second</div>
      </div>
    </div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-amber" style="max-width:340px;">
      <div class="ns-node-title">Critique Agent (optional)</div>
      <div class="ns-node-sub">Evaluates output quality. Feeds back into router logic — if Flash keeps failing on certain query types, router learns to route those to Pro instead.</div>
    </div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-green" style="max-width:300px;">
      <div class="ns-node-title">Final Response</div>
      <div class="ns-node-sub">Correct answer · Delivered within budget · Appropriate latency for the query type</div>
    </div>
  </div>
</div>

---

## Interactive: Query Router Demo

See how the router classifies different queries and routes them to the right model:

<div class="rao-demo-wrapper">
  <div class="rao-demo-header">
    <span class="rao-demo-title">QUERY ROUTER LIVE DEMO</span>
    <button class="rao-demo-btn" id="raoDemoRunBtn" disabled>▶ Route Query</button>
  </div>
  <div class="rao-demo-queries">
    <button class="rao-q-btn active" data-idx="0" onclick="raoSelect(0)">Simple fact</button>
    <button class="rao-q-btn" data-idx="1" onclick="raoSelect(1)">Complex reasoning</button>
    <button class="rao-q-btn" data-idx="2" onclick="raoSelect(2)">Current events</button>
    <button class="rao-q-btn" data-idx="3" onclick="raoSelect(3)">Math problem</button>
  </div>
  <div class="rao-demo-body">
    <div class="rao-demo-query-display">
      <span class="rao-q-label">QUERY</span>
      <span class="rao-q-text" id="raoQueryText">What is the capital of Australia?</span>
    </div>
    <div class="rao-demo-steps" id="raoDemoSteps"></div>
  </div>
</div>

<style>
.rao-demo-wrapper { border: 1px solid var(--global-divider-color); border-radius: 10px; overflow: hidden; margin: 2rem 0; }
.rao-demo-header { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1.1rem; border-bottom: 1px solid var(--global-divider-color); background: rgba(128,128,128,0.05); }
.rao-demo-title { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--global-text-color); }
.rao-demo-btn { font-family: monospace; font-size: 0.72rem; padding: 0.3rem 0.8rem; border-radius: 4px; border: 1px solid var(--global-divider-color); background: transparent; color: var(--global-text-color); cursor: pointer; transition: background 0.15s; }
.rao-demo-btn:not(:disabled):hover { background: rgba(38,152,186,0.12); border-color:#2698ba; color:#2698ba; }
.rao-demo-btn:disabled { opacity: 0.4; cursor: default; }
.rao-demo-queries { display: flex; border-bottom: 1px solid var(--global-divider-color); overflow-x: auto; }
.rao-q-btn { flex: 1; min-width: 100px; padding: 0.5rem; font-family: monospace; font-size: 0.68rem; border: none; border-right: 1px solid var(--global-divider-color); background: transparent; color: var(--global-text-color-light); cursor: pointer; white-space: nowrap; }
.rao-q-btn:last-child { border-right: none; }
.rao-q-btn.active { background: rgba(38,152,186,0.1); color: #2698ba; font-weight: 700; }
.rao-demo-body { padding: 1rem 1.1rem; display: flex; flex-direction: column; gap: 0.75rem; }
.rao-demo-query-display { border: 1px solid var(--global-divider-color); border-radius: 6px; padding: 0.6rem 0.9rem; display: flex; align-items: center; gap: 0.75rem; background: rgba(128,128,128,0.04); }
.rao-q-label { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.1em; color: #2698ba; flex-shrink: 0; }
.rao-q-text { font-size: 0.82rem; color: var(--global-text-color); font-family: monospace; }
.rao-demo-steps { display: flex; flex-direction: column; gap: 0.5rem; }
.rao-step { border: 1px solid var(--global-divider-color); border-radius: 7px; padding: 0.65rem 0.85rem; animation: raoIn 0.3s ease; }
@keyframes raoIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:none; } }
.rao-step-label { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--global-text-color-light); margin-bottom: 0.3rem; }
.rao-step-content { font-size: 0.8rem; color: var(--global-text-color); line-height: 1.55; }
.rao-step.classify { border-color: rgba(201,122,242,0.3); background: rgba(201,122,242,0.05); }
.rao-step.route { border-color: rgba(230,168,23,0.3); background: rgba(230,168,23,0.05); }
.rao-step.answer { border-color: rgba(79,201,126,0.3); background: rgba(79,201,126,0.07); }
.rao-step-model { font-size: 0.65rem; font-family: monospace; padding: 0.1em 0.4em; border-radius: 3px; margin-left: 0.4rem; }
.rao-model-flash { background: rgba(79,201,126,0.15); color: #4fc97e; border: 1px solid rgba(79,201,126,0.3); }
.rao-model-pro   { background: rgba(255,107,107,0.12); color: #ff6b6b; border: 1px solid rgba(255,107,107,0.3); }
.rao-model-search{ background: rgba(38,152,186,0.12); color: #7dcfff; border: 1px solid rgba(38,152,186,0.3); }
</style>

<script>
var RAO_QUERIES = [
  {
    text: "What is the capital of Australia?",
    classification: "simple",
    reason: "Direct factual recall — no reasoning chain needed. Any small model has this memorized.",
    model: "gpt-4o-mini (Flash)",
    modelClass: "flash",
    cost: "~$0.0003",
    latency: "0.8s",
    answer: "The capital of Australia is Canberra, not Sydney as many people assume. Canberra was purpose-built as a compromise between Sydney and Melbourne when Australia federated in 1901."
  },
  {
    text: "Should a startup use microservices or a monolith for its first product?",
    classification: "reasoning",
    reason: "Multi-factor trade-off analysis requiring understanding of team size, deployment complexity, technical debt, scalability timing. Needs sophisticated reasoning.",
    model: "gemini-2.5-pro (Pro)",
    modelClass: "pro",
    cost: "~$0.015",
    latency: "8.2s",
    answer: "For a first product, almost always start with a monolith. Microservices add operational overhead (service discovery, network latency, distributed tracing) that slows down a small team. Migrate to microservices only after you understand the natural seam lines in your domain — typically when you have 5+ teams working on the same codebase."
  },
  {
    text: "What did the Fed announce about interest rates this week?",
    classification: "internet_search",
    reason: "Requires real-time information from this week — no training data can contain this. Must search the web first, then synthesize.",
    model: "Search → gpt-4o (Standard)",
    modelClass: "search",
    cost: "~$0.008",
    latency: "4.5s",
    answer: "[After web search] Based on recent news: The Federal Reserve held rates steady at 4.25–4.50% at their latest FOMC meeting, citing continued progress on inflation but noting uncertainty around trade policy impacts. (Source: Reuters, this week)"
  },
  {
    text: "If a train leaves Chicago at 9am going 80mph, and another leaves Boston at 10am going 65mph, when do they meet (1,000 miles apart)?",
    classification: "reasoning",
    reason: "Multi-step mathematical word problem requiring algebraic reasoning. Flash models often make arithmetic errors on word problems; Pro model handles with higher reliability.",
    model: "o4-mini (Reasoning)",
    modelClass: "pro",
    cost: "~$0.012",
    latency: "6.1s",
    answer: "Train A travels at 80mph from mile 0. Train B travels at 65mph from mile 1000 toward Train A. They approach at 80+65=145mph. Train B starts 1 hour later, so by 10am Train A is at mile 80. Remaining gap: 920 miles at 145mph combined = 6.34 hours. They meet at approximately 4:20pm, roughly 587 miles from Chicago."
  }
];

var raoIdx = 0;
var raoRunning = false;

function raoSelect(idx) {
  raoIdx = idx;
  document.querySelectorAll('.rao-q-btn').forEach(function(b){ b.classList.remove('active'); });
  document.querySelector('.rao-q-btn[data-idx="'+idx+'"]').classList.add('active');
  document.getElementById('raoQueryText').textContent = RAO_QUERIES[idx].text;
  document.getElementById('raoDemoSteps').innerHTML = '';
  var btn = document.getElementById('raoDemoRunBtn');
  btn.disabled = false;
  btn.textContent = '▶ Route Query';
}

document.addEventListener('DOMContentLoaded', function(){
  raoSelect(0);
  var btn = document.getElementById('raoDemoRunBtn');
  btn.addEventListener('click', async function(){
    if (raoRunning) return;
    raoRunning = true;
    btn.disabled = true;
    btn.textContent = '⏳ Routing…';

    var steps = document.getElementById('raoDemoSteps');
    steps.innerHTML = '';
    var q = RAO_QUERIES[raoIdx];

    await new Promise(function(r){ setTimeout(r, 500); });
    var s1 = document.createElement('div'); s1.className = 'rao-step classify';
    s1.innerHTML = '<div class="rao-step-label">01 — Classification (Router Agent)</div>' +
      '<div class="rao-step-content"><strong>Category: ' + q.classification + '</strong><br>' + q.reason + '</div>';
    steps.appendChild(s1);

    await new Promise(function(r){ setTimeout(r, 700); });
    var s2 = document.createElement('div'); s2.className = 'rao-step route';
    s2.innerHTML = '<div class="rao-step-label">02 — Model Selection</div>' +
      '<div class="rao-step-content">Selected: <strong>' + q.model + '</strong>' +
      '<span class="rao-step-model rao-model-' + q.modelClass + '">' + q.modelClass.toUpperCase() + '</span><br>' +
      'Estimated cost: <strong>' + q.cost + '</strong> &nbsp;·&nbsp; Expected latency: <strong>' + q.latency + '</strong></div>';
    steps.appendChild(s2);

    await new Promise(function(r){ setTimeout(r, 800); });
    var s3 = document.createElement('div'); s3.className = 'rao-step answer';
    s3.innerHTML = '<div class="rao-step-label">03 — Response</div>' +
      '<div class="rao-step-content">' + q.answer + '</div>';
    steps.appendChild(s3);

    raoRunning = false;
    btn.textContent = '↺ Try Again';
    btn.disabled = false;
  });
});
</script>

---

## The Code: Three Implementations

### Implementation 1: ADK with Model Tiers

```python
from google.adk.agents import Agent

# Tier 1: Fast, cheap — for simple queries, routing, classification
gemini_flash_agent = Agent(
    name        = "GeminiFlashAgent",
    model       = "gemini-2.5-flash",
    description = "A fast, cost-efficient agent for simple, well-defined queries.",
    instruction = "Answer concisely. For factual questions, give the direct answer without elaboration. Be fast."
)

# Tier 2: Powerful, expensive — for complex reasoning
gemini_pro_agent = Agent(
    name        = "GeminiProAgent",
    model       = "gemini-2.5-pro",
    description = "A highly capable agent for complex analytical and reasoning tasks.",
    instruction = "Take your time to reason carefully. Show your thought process. Prioritize accuracy over brevity."
)
```

> **Why different instructions for different tiers?** The instruction shapes the model's behavior beyond just its capability. The Flash agent is told to be concise and fast — it shouldn't pad its responses. The Pro agent is told to reason carefully and show work — it should use its full capability, even if that means longer responses. The instruction *activates* the tier's strengths.

### Implementation 2: Query Router Agent

```python
from google.adk.agents import BaseAgent
from google.adk.events import Event
from google.adk.agents.invocation_context import InvocationContext
from typing import AsyncGenerator

class QueryRouterAgent(BaseAgent):
    """Routes incoming queries to the appropriate model tier based on complexity."""
    name:        str = "QueryRouter"
    description: str = "Routes queries to Flash (simple) or Pro (complex) based on analysis."

    async def _run_async_impl(
        self, context: InvocationContext
    ) -> AsyncGenerator[Event, None]:
        user_query    = context.current_message.text
        query_words   = len(user_query.split())
        query_lower   = user_query.lower()

        # Complexity signals
        is_long_query      = query_words > 20
        needs_reasoning    = any(kw in query_lower for kw in
                                ['why', 'how', 'explain', 'compare', 'analyze',
                                 'evaluate', 'design', 'recommend', 'trade-off'])
        needs_current_data = any(kw in query_lower for kw in
                                ['today', 'this week', 'latest', 'current',
                                 'recent', 'now', '2025', '2026'])
        needs_math         = any(kw in query_lower for kw in
                                ['calculate', 'solve', 'equation', 'probability',
                                 'percent', 'if x then'])

        # Routing decision
        if needs_current_data:
            route = "search_and_synthesize"
            model_used = "google_search + gemini-2.5-flash"
        elif needs_reasoning or needs_math or is_long_query:
            route = "complex"
            model_used = "gemini-2.5-pro"
        else:
            route = "simple"
            model_used = "gemini-2.5-flash"

        yield Event(
            author  = self.name,
            content = f"Routing '{user_query[:50]}...' → {route} (model: {model_used})"
        )
```

> **Rule-based vs LLM-based routing.** This implementation uses keyword matching — fast and predictable, but brittle. It will misclassify edge cases (e.g., "why is the sky blue?" is classified as complex because of "why" but is actually simple). A more sophisticated router would use an LLM to classify queries based on semantic understanding rather than keywords. The trade-off: LLM routing is ~$0.0001 per classification call but far more accurate. Use keyword routing for high-volume, cost-critical systems; use LLM routing when accuracy matters more than classification cost.

> **Why check `needs_current_data` first?** The routing conditions are evaluated in priority order. If a query needs current data, that overrides complexity — even a simple question about today's news requires search. By checking this first, you ensure real-time queries always get search capability, not just a model upgrade.

### Implementation 3: The Critique Agent

```python
CRITIC_SYSTEM_PROMPT = """
You are the Critique Agent — the quality assurance layer of our multi-model system.
Your function: evaluate responses from other models and identify systematic failures.

For each response you review, assess:
1. ACCURACY: Is the factual content correct?
2. COMPLETENESS: Does it fully address the question?
3. APPROPRIATE DEPTH: Is the detail level right for the question's complexity?
4. ROUTING SIGNAL: Was this the right model for this query type?

Return structured feedback:
- verdict: "correct" | "needs_refinement" | "wrong_model"
- if wrong_model: suggest "should_use_flash" | "should_use_pro"
- specific_issues: list of concrete problems found
- confidence: 0.0 to 1.0

Be constructive. Flag systematic misrouting — if Flash keeps struggling with
a category, that's a signal to update the router's classification rules.
"""
```

> **Why "wrong_model" is a routing signal, not just a quality signal.** When the Critique Agent says "wrong_model: should_use_flash," it's identifying a case where the router sent a simple query to the Pro model unnecessarily — overspending. When it says "wrong_model: should_use_pro," it's identifying a case where the router sent a complex query to Flash — producing a poor result. Both are actionable: the first wastes money, the second wastes quality. Tracking these misrouting events over time reveals systematic biases in the router's classification logic that can be corrected.

---

## OpenRouter: Multi-Provider Optimization

OpenRouter is a third-party service that simplifies resource-aware optimization by providing:
- A single API endpoint for 200+ models from all major providers
- Automatic model selection (`openrouter/auto`)
- Sequential fallback chains
- Real-time pricing and latency data

```python
import requests, json

# Simple request with automatic model selection
response = requests.post(
    url     = "https://openrouter.ai/api/v1/chat/completions",
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "X-Title":       "My Agent App",
    },
    data = json.dumps({
        "model": "openrouter/auto",     # ← OpenRouter picks the best model for this query
        "messages": [
            {"role": "user", "content": "What is the capital of France?"}
        ]
    })
)
```

> **`"model": "openrouter/auto"`**: OpenRouter analyzes the prompt and selects the most cost-effective model that can handle it well. For a simple factual question, it might choose a Flash-tier model. For a complex reasoning question, it upgrades automatically. The selection considers: prompt complexity, available model performance data, current pricing, and latency requirements.

### Sequential Fallback Chain

```python
# Fallback chain: try Claude 3.5 Sonnet first, fall back to a cheaper model if it fails
response = requests.post(
    url  = "https://openrouter.ai/api/v1/chat/completions",
    headers = {"Authorization": f"Bearer {OPENROUTER_API_KEY}"},
    data = json.dumps({
        "models": [
            "anthropic/claude-sonnet-4-5",  # Try first — preferred quality
            "openai/gpt-4o-mini",           # Fallback 1 — if Claude is unavailable
            "google/gemini-flash-1.5",      # Fallback 2 — cheapest option
        ],
        "messages": [{"role": "user", "content": user_query}]
    })
)

# The response includes which model was actually used
model_used = response.json()["model"]
print(f"Served by: {model_used}")
```

> **Why the fallback chain is valuable in production.** LLM APIs have outages, rate limits, and regional availability issues. If you're hard-coded to one model and it goes down, your entire application fails. The fallback chain provides automatic resilience: Claude is down → seamlessly serve from GPT-4o-mini → users never notice. This is [graceful degradation](/kohshh-portfolio/blog/2026/exception-handling/) (Chapter 12) applied at the model layer.

> **The response always tells you which model was used.** This is critical for cost tracking, quality auditing, and identifying when fallbacks fire more than expected. If you notice you're serving from the fallback 30% of the time, that's a signal your primary model has reliability issues you should address.

---

## Implementation 4: Full Three-Tier System with OpenAI

```python
import os, json, requests
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def classify_prompt(prompt: str) -> dict:
    """Use a cheap model to classify query complexity — the router itself must be cheap."""
    response = client.chat.completions.create(
        model       = "gpt-4o-mini",   # Cheapest capable classifier
        temperature = 0,               # Deterministic — routing must be consistent
        messages    = [
            {
                "role": "system",
                "content": (
                    "Classify the user prompt into exactly one category: "
                    "simple, reasoning, or internet_search.\n\n"
                    "- simple: direct factual questions answerable from training data\n"
                    "- reasoning: logic, math, multi-step analysis, trade-off evaluation\n"
                    "- internet_search: requires current data, real-time events, recent news\n\n"
                    "Respond ONLY with JSON: {\"classification\": \"<category>\"}"
                )
            },
            {"role": "user", "content": prompt}
        ]
    )
    return json.loads(response.choices[0].message.content)
```

> **`temperature=0` for the classifier.** The classification decision must be deterministic and consistent. If the same query is classified differently on each call, the system becomes unpredictable — the same query might get routed to Flash one time and Pro the next, producing different costs and quality. `temperature=0` ensures the same input always produces the same classification.

> **Why use `gpt-4o-mini` for classification, not a cheaper model?** The classifier needs to reliably distinguish "simple," "reasoning," and "internet_search" — this requires semantic understanding beyond keyword matching. Using a model that's too cheap might produce unreliable classifications, routing complex queries to Flash (wrong quality) or simple queries to Pro (wrong cost). The classification model should be the cheapest model that classifies accurately for your query distribution.

```python
def generate_response(prompt: str, classification: str, search_results=None) -> tuple:
    """Route to the appropriate model based on classification."""
    if classification == "simple":
        model      = "gpt-4o-mini"    # $0.15/1M input, $0.60/1M output
        full_prompt = prompt

    elif classification == "reasoning":
        model       = "o4-mini"       # Reasoning model with chain-of-thought
        full_prompt = prompt

    elif classification == "internet_search":
        model = "gpt-4o"              # Standard model for synthesis with search context
        if search_results:
            search_context = "\n".join([
                f"Title: {r['title']}\nSnippet: {r['snippet']}\nURL: {r['link']}"
                for r in search_results
            ])
            full_prompt = f"""Use ONLY these web results to answer. Cite sources.\n\n{search_context}\n\nQuestion: {prompt}"""
        else:
            full_prompt = f"Note: web search returned no results. Answer from training data with a caveat.\n\n{prompt}"

    response = client.chat.completions.create(
        model    = model,
        messages = [{"role": "user", "content": full_prompt}],
    )
    return response.choices[0].message.content, model
```

> **Why different models for different categories?** Each model was chosen for the category it dominates:
> - `gpt-4o-mini` for "simple": cheapest model that handles factual recall with high reliability
> - `o4-mini` for "reasoning": the `o`-series models have explicit chain-of-thought reasoning built in, dramatically improving performance on math and multi-step logic vs standard models
> - `gpt-4o` for "search": synthesis tasks require reading and integrating retrieved text, a task standard models handle well; the full `gpt-4o` is better than mini for this use case

```python
def handle_prompt(prompt: str) -> dict:
    """Orchestrate the full resource-aware pipeline."""
    # Step 1: Classify (cheap)
    classification = classify_prompt(prompt)["classification"]

    # Step 2: Retrieve if needed (medium cost)
    search_results = None
    if classification == "internet_search":
        search_results = google_search(prompt)

    # Step 3: Generate (model cost depends on classification)
    answer, model_used = generate_response(prompt, classification, search_results)

    return {
        "classification": classification,
        "model_used":     model_used,
        "response":       answer,
    }
```

> **The pipeline's cost structure.** Every query pays the classification cost (cheap, ~$0.0001). Then the routing kicks in:
> - Simple queries: pay cheap generation cost (~$0.0003) → total ~$0.0004
> - Reasoning queries: pay Pro generation cost (~$0.015) → total ~$0.0151
> - Search queries: pay search API cost (~$0.005) + standard generation (~$0.008) → total ~$0.0131
>
> The classification cost is negligible. The savings come from routing ~70-80% of queries to cheap models instead of expensive ones.

---

## The Nine Optimization Techniques

Resource-aware optimization extends beyond model switching. Here's the full spectrum:

<div class="rao-techniques-grid">
  <div class="rao-tech-card">
    <span class="rao-tech-num">01</span>
    <h4>Dynamic Model Switching</h4>
    <p>Route to different model tiers based on query complexity. The pattern we've been building throughout this chapter.</p>
  </div>
  <div class="rao-tech-card">
    <span class="rao-tech-num">02</span>
    <h4>Adaptive Tool Selection</h4>
    <p>Choose between tools based on cost and speed. Use a cached database lookup before an expensive live API call. Prefer a local index before a web search.</p>
  </div>
  <div class="rao-tech-card">
    <span class="rao-tech-num">03</span>
    <h4>Contextual Pruning</h4>
    <p>Summarize or truncate long conversation history before sending to the LLM. Fewer input tokens = lower cost. Prioritize the most recent and most relevant context.</p>
  </div>
  <div class="rao-tech-card">
    <span class="rao-tech-num">04</span>
    <h4>Proactive Resource Prediction</h4>
    <p>Forecast expected query volume and provision resources in advance. Avoids cold-start latency and capacity shortfalls during peak traffic.</p>
  </div>
  <div class="rao-tech-card">
    <span class="rao-tech-num">05</span>
    <h4>Cost-Sensitive Multi-Agent Coordination</h4>
    <p>Optimize communication costs between agents in addition to computation. Batch small messages, compress serialized state, avoid redundant cross-agent calls.</p>
  </div>
  <div class="rao-tech-card">
    <span class="rao-tech-num">06</span>
    <h4>Energy-Efficient Deployment</h4>
    <p>For edge devices (IoT, mobile), minimize inference frequency and prefer quantized, compressed models. Important for battery-constrained environments.</p>
  </div>
  <div class="rao-tech-card">
    <span class="rao-tech-num">07</span>
    <h4>Parallelization Awareness</h4>
    <p>When multiple independent sub-tasks exist, parallelize them (Chapter 3 pattern). Total time = max(T_tasks), not sum(T_tasks). Coordinate resource allocation across parallel branches.</p>
  </div>
  <div class="rao-tech-card">
    <span class="rao-tech-num">08</span>
    <h4>Learned Resource Allocation</h4>
    <p>Use the Critique Agent's feedback over time to retrain the router. If Flash consistently fails on certain query patterns, update the classifier. The system improves from its own production traffic.</p>
  </div>
  <div class="rao-tech-card">
    <span class="rao-tech-num">09</span>
    <h4>Graceful Degradation + Fallback</h4>
    <p>When primary resources are exhausted or unavailable, automatically fall back to cheaper/simpler alternatives. Serve a reduced-quality response rather than failing completely. (Chapter 12 pattern applied at the resource layer.)</p>
  </div>
</div>

<style>
.rao-techniques-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.85rem; margin: 1.5rem 0; }
.rao-tech-card { border: 1px solid var(--global-divider-color); border-radius: 8px; padding: 1rem; background: rgba(128,128,128,0.04); display: flex; flex-direction: column; gap: 0.4rem; }
.rao-tech-num { font-family: monospace; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.1em; color: #e6a817; }
.rao-tech-card h4 { font-size: 0.85rem; font-weight: 700; margin: 0; color: var(--global-text-color); }
.rao-tech-card p  { font-size: 0.78rem; color: var(--global-text-color-light); margin: 0; line-height: 1.5; }
</style>

---

## At a Glance

<div class="rao-summary-card">
  <div class="rao-summary-col">
    <div class="rao-summary-label">WHAT</div>
    <p>A pattern for dynamically matching computational resources to task requirements. Simple queries route to cheap, fast models. Complex queries route to powerful, expensive ones. A critique agent monitors quality and improves routing over time.</p>
  </div>
  <div class="rao-summary-divider"></div>
  <div class="rao-summary-col">
    <div class="rao-summary-label">WHY</div>
    <p>Routing all queries to the most capable (and most expensive) model wastes 70-90% of API costs on queries that a much cheaper model handles equally well. Resource-aware optimization preserves quality where it matters while eliminating waste where it doesn't.</p>
  </div>
  <div class="rao-summary-divider"></div>
  <div class="rao-summary-col">
    <div class="rao-summary-label">RULE OF THUMB</div>
    <p>Start by measuring your query distribution: what fraction is simple, complex, or search-requiring? If >50% is simple, this pattern pays for itself immediately. Use OpenRouter for easy multi-model fallback; build custom routers when query distribution requires specialized classification.</p>
  </div>
</div>

<style>
.rao-summary-card { display: flex; border: 1px solid var(--global-divider-color); border-radius: 10px; overflow: hidden; margin: 1.5rem 0; }
@media (max-width: 640px) { .rao-summary-card { flex-direction: column; } }
.rao-summary-col { flex: 1; padding: 1.1rem; background: rgba(128,128,128,0.03); }
.rao-summary-col p { font-size: 0.8rem; color: var(--global-text-color-light); line-height: 1.6; margin: 0.4rem 0 0; }
.rao-summary-divider { width: 1px; background: var(--global-divider-color); flex-shrink: 0; }
.rao-summary-label { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.12em; color: #e6a817; }
</style>

---

## Key Takeaways

- **Over-provisioning is the default failure mode.** Without resource optimization, developers pick one capable model and route everything to it. This works but wastes 70-90% of API budget on queries that didn't need that capability.

- **The routing cost must be much less than the savings.** If classifying a query costs $0.001 and the savings from routing to a cheaper model is $0.0005, routing costs more than it saves. Use the cheapest reliable classifier — `gpt-4o-mini`, Gemini Flash, or keyword matching.

- **`temperature=0` for all routing and classification calls.** The routing decision must be deterministic. Non-zero temperature introduces randomness into which model serves a query, making cost and quality unpredictable and unreproducible.

- **The three-tier classification (simple / reasoning / internet_search) covers 95% of cases.** These three categories map cleanly to different computational requirements: factual recall, chain-of-thought reasoning, and real-time retrieval. Most production systems can start with just these three.

- **OpenRouter provides zero-code fallback chains.** Instead of implementing retry/fallback logic yourself, the `"models": [list]` parameter in OpenRouter handles it automatically. The simplest resilient multi-model system is a one-line configuration change.

- **The Critique Agent converts production traffic into training data.** Every query where the Critique Agent says "wrong_model" is a labeled example of router misclassification. Collect these, analyze the patterns, and update the router's classification logic. The system improves itself from its own errors.

- **Model tiers are not fixed — the landscape changes fast.** What's "Pro" today becomes "Flash" next year. Gemini 2.5 Flash matches the capability of last year's Pro models. Build your resource-aware system with abstraction between the routing logic and the specific model names — use configuration or constants, not hardcoded strings, so updating model choices requires changing one line not twenty.

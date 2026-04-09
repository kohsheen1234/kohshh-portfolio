---
layout: post
title: "Chapter 3: Parallelization"
description: "Sequential is clean. Parallel is fast. The art is knowing which tasks can run at the same time — and wiring the plumbing to make it happen."
tags: agentic-ai llm parallelization
date: 2026-01-13
featured: true
author: Kohsheen Tiku
toc: true
mermaid:
  enabled: true
  zoomable: true
---

## The Problem with Waiting

<div class="concept-box">
  <span class="concept-label">Before You Start — Key Terms Explained</span>
  <p><strong>Latency:</strong> The time it takes for a response to arrive. If an API takes 2 seconds to respond, its latency is 2 seconds. In agents, total latency = sum of all sequential steps. Parallelization reduces this.</p>
  <p style="margin-top:0.5rem"><strong>I/O-bound vs CPU-bound:</strong> "I/O bound" means the code spends most of its time <em>waiting</em> for input/output (network responses, disk reads). "CPU bound" means it's actively computing. Async (asyncio) helps I/O-bound tasks — it's useless for CPU-bound work.</p>
  <p style="margin-top:0.5rem"><strong>async/await:</strong> Python keywords for writing code that can pause while waiting (e.g., for an API response) and let other code run in the meantime. <code>async def</code> marks a function as async. <code>await</code> pauses that function until a result is ready. This is NOT the same as running on multiple CPU cores.</p>
  <p style="margin-top:0.5rem"><strong>Event loop:</strong> The engine that powers asyncio. It keeps a list of tasks, runs one until it hits an <code>await</code> (waiting point), then switches to another task. It's like a chef managing multiple dishes — not cooking two things simultaneously, but switching attention efficiently.</p>
  <p style="margin-top:0.5rem"><strong>GIL (Global Interpreter Lock):</strong> A Python rule that only allows one thread to execute Python code at a time. This is why Python threads don't give true CPU parallelism. But for I/O-bound work (like LLM API calls), the GIL barely matters because the thread is just <em>waiting</em>, not executing.</p>
</div>

In [Chapter 1](/kohshh-portfolio/blog/2026/prompt-chaining/) we chained steps sequentially. In [Chapter 2](/kohshh-portfolio/blog/2026/routing/) we added decision-making. Both assume the same thing: **one step runs, finishes, then the next begins**.

That's the right model when each step genuinely needs the previous step's output. But often, it isn't necessary — it's just the default.

Imagine your agent needs to research a company. It pulls:

| Task | Simulated latency |
|---|---|
| Search recent news | 1.2 s |
| Fetch stock price data | 0.9 s |
| Check social media mentions | 0.7 s |
| Query internal company database | 1.5 s |
| **Synthesize all findings** | 0.8 s |

**Sequential total: 5.1 seconds.** Every task waits for the one before it — even though none of them depend on each other.

Now think about it differently. News search doesn't need stock data to start. Social media check doesn't need news results. All four lookups are completely independent. So fire them all at once. Wait for the slowest (1.5 s), then synthesize.

**Parallel total: 2.3 seconds.** Same answer. **2.2× faster.**

That's **parallelization**: identify the independent tasks, fire them concurrently, wait for everything to land, then continue.


## The Core Concept

Parallelization rests on one rule:

> **If Task B doesn't need Task A's output to start, Task B can start the moment Task A starts.**

<div class="ns-diagram">
  <div class="ns-diagram-header">
    <span class="ns-diagram-label">PARALLELIZATION PATTERN</span>
    <button class="ns-expand-btn" onclick="openNsDiagram(this)"><svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 5V1h4M11 7v4H7M1 5l4-4M11 7l-4 4"/></svg> Expand</button>
  </div>
  <div class="ns-diagram-body">
    <div class="ns-node ns-node-cyan">
      <div class="ns-node-title">Input Query</div>
      <div class="ns-node-sub">Single request · fans out to independent workers</div>
    </div>
    <div class="ns-arrow"></div>
    <div class="ns-phase">
      <div class="ns-phase-title">Parallel Execution — all start simultaneously</div>
      <div class="ns-phase-sub">Independent tasks run concurrently · no waiting</div>
      <div class="ns-row">
        <div class="ns-node ns-node-purple">
          <div class="ns-node-title">Task A</div>
          <div class="ns-node-sub">Search News · 1.2s</div>
        </div>
        <div class="ns-node ns-node-purple">
          <div class="ns-node-title">Task B</div>
          <div class="ns-node-sub">Fetch Stock · 0.9s</div>
        </div>
        <div class="ns-node ns-node-purple">
          <div class="ns-node-title">Task C</div>
          <div class="ns-node-sub">Query DB · 1.5s</div>
        </div>
      </div>
    </div>
    <div class="ns-arrow"></div>
    <div class="ns-node">
      <div class="ns-node-title">Wait for slowest · 1.5s</div>
      <div class="ns-node-sub">All parallel results collected before proceeding</div>
    </div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-green">
      <div class="ns-node-title">Synthesize</div>
      <div class="ns-node-sub">Merge all outputs into one final answer · 0.8s</div>
    </div>
  </div>
</div>

The input fans out to independent tasks. They run simultaneously. Their outputs converge at a single synthesis step.

Notice: the **synthesis step is still sequential** — it must wait for all parallel tasks before it can begin. You're not removing sequential dependencies; you're removing *unnecessary* ones.


## The Time Difference, Visualized

<div class="par-timeline-wrapper">
  <div class="par-timeline-header">
    <span class="par-timeline-title">SEQUENTIAL vs PARALLEL — EXECUTION TIMELINE</span>
    <div class="par-timeline-controls">
      <button class="par-timeline-btn" id="timelinePlayBtn">▶ Animate</button>
    </div>
  </div>
  <canvas id="parallelTimeline" style="display:block;width:100%;"></canvas>
  <div class="par-timeline-footer" id="timelineBadge" style="display:none">
    <span class="par-badge-highlight">2.2×</span> faster — same result
    <span class="par-badge-sub">Sequential: 5.1s &nbsp;·&nbsp; Parallel: 2.3s</span>
  </div>
</div>

<style>
.par-timeline-wrapper {
  border: 1px solid var(--global-divider-color);
  border-radius: 10px;
  overflow: hidden;
  margin: 2rem 0;
}
.par-timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.1rem;
  border-bottom: 1px solid var(--global-divider-color);
  background: rgba(128,128,128,0.05);
}
.par-timeline-title {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--global-text-color);
}
.par-timeline-btn {
  font-family: monospace;
  font-size: 0.72rem;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  border: 1px solid var(--global-divider-color);
  background: transparent;
  color: var(--global-text-color);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.par-timeline-btn:hover { background: rgba(38,152,186,0.15); border-color: #2698ba; color: #2698ba; }
.par-timeline-footer {
  padding: 0.65rem 1.1rem;
  border-top: 1px solid var(--global-divider-color);
  background: rgba(79,201,126,0.07);
  font-size: 0.78rem;
  color: var(--global-text-color);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.par-badge-highlight {
  font-size: 1.2rem;
  font-weight: 800;
  color: #4fc97e;
  letter-spacing: -0.01em;
}
.par-badge-sub {
  margin-left: auto;
  font-size: 0.68rem;
  color: var(--global-text-color-light);
  letter-spacing: 0.05em;
}
</style>

<script>
(function(){
  var canvas = document.getElementById('parallelTimeline');
  var playBtn = document.getElementById('timelinePlayBtn');
  var badge   = document.getElementById('timelineBadge');
  if (!canvas || !playBtn) return;

  var tasks = [
    { label: 'Search News',  dur: 1.2, color: '#2698ba' },
    { label: 'Fetch Stock',  dur: 0.9, color: '#4fc97e' },
    { label: 'Check Social', dur: 0.7, color: '#e6a817' },
    { label: 'Query DB',     dur: 1.5, color: '#c97af2' },
    { label: 'Synthesize',   dur: 0.8, color: '#ff6b6b' },
  ];

  // Sequential start times
  var seqStarts = [0, 1.2, 2.1, 2.8, 4.3]; // cumulative
  var SEQ_TOTAL = 5.1;

  // Parallel start times
  var parStarts  = [0, 0, 0, 0, 1.5]; // first 4 at t=0, synth at t=1.5
  var PAR_TOTAL  = 2.3;

  var SCALE = SEQ_TOTAL; // timeline goes 0..5.1 for both sections

  var LABEL_W = 112;
  var PAD_L   = 12;
  var PAD_R   = 16;
  var ROW_H   = 22;
  var ROW_GAP = 5;
  var SEC_HEAD = 28;
  var SEC_PAD  = 14;
  var SEC_H    = SEC_HEAD + tasks.length * (ROW_H + ROW_GAP);
  var CANVAS_H = SEC_H * 2 + 24;

  function setupCanvas() {
    var dpr = window.devicePixelRatio || 1;
    var W = canvas.parentElement ? canvas.parentElement.getBoundingClientRect().width : 600;
    if (W < 10) W = 600;
    canvas.width  = W * dpr;
    canvas.height = CANVAS_H * dpr;
    canvas.style.height = CANVAS_H + 'px';
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx: ctx, W: W };
  }

  function getTheme() {
    var s = getComputedStyle(document.documentElement);
    return {
      text:  s.getPropertyValue('--global-text-color').trim()       || '#e0e0e0',
      muted: s.getPropertyValue('--global-text-color-light').trim() || '#888',
      div:   s.getPropertyValue('--global-divider-color').trim()    || '#333',
      bg:    s.getPropertyValue('--global-bg-color').trim()         || '#111',
    };
  }

  function drawTimeline(progress) {
    var setup = setupCanvas();
    var ctx = setup.ctx, W = setup.W;
    var th = getTheme();
    var tlW = W - LABEL_W - PAD_L - PAD_R;

    ctx.clearRect(0, 0, W, CANVAS_H);

    // ── Section A: Sequential ──
    var secAY = 0;
    ctx.font = '700 10px monospace';
    ctx.fillStyle = th.muted;
    ctx.textAlign = 'left';
    ctx.fillText('SEQUENTIAL', PAD_L, secAY + 14);
    var seqDoneTime = progress * SCALE;
    var seqLabel = seqDoneTime < SEQ_TOTAL
      ? (seqDoneTime.toFixed(1) + 's')
      : 'TOTAL: 5.1s';
    ctx.font = '10px monospace';
    ctx.fillStyle = seqDoneTime >= SEQ_TOTAL ? '#ff6b6b' : th.muted;
    ctx.textAlign = 'right';
    ctx.fillText(seqLabel, W - PAD_R, secAY + 14);

    tasks.forEach(function(t, i) {
      var rowY = secAY + SEC_HEAD + i * (ROW_H + ROW_GAP);
      var tStart = seqStarts[i], tEnd = tStart + t.dur;
      var xStart = LABEL_W + (tStart / SCALE) * tlW;
      var xEnd   = LABEL_W + (Math.min(tEnd, seqDoneTime) / SCALE) * tlW;
      var filled  = seqDoneTime >= tStart;

      // Row bg
      ctx.fillStyle = 'rgba(128,128,128,0.06)';
      ctx.fillRect(LABEL_W, rowY, tlW, ROW_H);

      // Filled bar
      if (filled) {
        var drawEnd = Math.min(xEnd, LABEL_W + tlW);
        if (drawEnd > xStart) {
          ctx.globalAlpha = 0.85;
          ctx.fillStyle = t.color;
          ctx.fillRect(xStart, rowY + 2, drawEnd - xStart, ROW_H - 4);
          ctx.globalAlpha = 1;
        }
      }

      // Label
      ctx.font = '11px monospace';
      ctx.fillStyle = filled && seqDoneTime >= tEnd ? t.color : th.muted;
      ctx.textAlign = 'right';
      ctx.fillText(t.label, LABEL_W - 8, rowY + ROW_H / 2 + 4);
    });

    // Time axis (seq)
    var axisY = secAY + SEC_HEAD + tasks.length * (ROW_H + ROW_GAP);
    ctx.strokeStyle = th.div; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(LABEL_W, axisY); ctx.lineTo(LABEL_W + tlW, axisY); ctx.stroke();
    [0,1,2,3,4,5].forEach(function(v) {
      var ax = LABEL_W + (v / SCALE) * tlW;
      ctx.fillStyle = th.muted; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText(v + 's', ax, axisY + 10);
      ctx.strokeStyle = th.div; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(ax, axisY); ctx.lineTo(ax, axisY + 3); ctx.stroke();
    });

    // ── Divider ──
    var divY = SEC_H + 8;
    ctx.strokeStyle = th.div; ctx.lineWidth = 0.5;
    ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(PAD_L, divY); ctx.lineTo(W - PAD_R, divY); ctx.stroke();
    ctx.setLineDash([]);

    // ── Section B: Parallel ──
    var secBY = SEC_H + 16;
    ctx.font = '700 10px monospace';
    ctx.fillStyle = th.muted;
    ctx.textAlign = 'left';
    ctx.fillText('PARALLEL', PAD_L, secBY + 14);
    var parDoneTime = seqDoneTime; // same clock
    var parLabel = parDoneTime < PAR_TOTAL
      ? (parDoneTime.toFixed(1) + 's')
      : 'TOTAL: 2.3s';
    ctx.font = '10px monospace';
    ctx.fillStyle = parDoneTime >= PAR_TOTAL ? '#4fc97e' : th.muted;
    ctx.textAlign = 'right';
    ctx.fillText(parLabel, W - PAD_R, secBY + 14);

    tasks.forEach(function(t, i) {
      var rowY = secBY + SEC_HEAD + i * (ROW_H + ROW_GAP);
      var tStart = parStarts[i], tEnd = tStart + t.dur;
      var xStart = LABEL_W + (tStart / SCALE) * tlW;
      var xEnd   = LABEL_W + (Math.min(tEnd, parDoneTime) / SCALE) * tlW;
      var filled  = parDoneTime >= tStart;

      ctx.fillStyle = 'rgba(128,128,128,0.06)';
      ctx.fillRect(LABEL_W, rowY, tlW, ROW_H);

      if (filled) {
        var drawEnd = Math.min(xEnd, LABEL_W + tlW);
        if (drawEnd > xStart) {
          ctx.globalAlpha = 0.85;
          ctx.fillStyle = t.color;
          ctx.fillRect(xStart, rowY + 2, drawEnd - xStart, ROW_H - 4);
          ctx.globalAlpha = 1;
        }
      }

      ctx.font = '11px monospace';
      ctx.fillStyle = filled && parDoneTime >= tEnd ? t.color : th.muted;
      ctx.textAlign = 'right';
      ctx.fillText(t.label, LABEL_W - 8, rowY + ROW_H / 2 + 4);
    });

    // Playhead (only during animation, up to PAR_TOTAL)
    if (progress > 0 && progress < 1) {
      var phX = LABEL_W + (parDoneTime / SCALE) * tlW;
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3,3]);
      ctx.beginPath();
      ctx.moveTo(phX, secBY + SEC_HEAD);
      ctx.lineTo(phX, secBY + SEC_HEAD + tasks.length * (ROW_H + ROW_GAP));
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Parallel axis
    var axisY2 = secBY + SEC_HEAD + tasks.length * (ROW_H + ROW_GAP);
    ctx.strokeStyle = th.div; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(LABEL_W, axisY2); ctx.lineTo(LABEL_W + tlW, axisY2); ctx.stroke();
    [0,1,2,3,4,5].forEach(function(v) {
      var ax = LABEL_W + (v / SCALE) * tlW;
      ctx.fillStyle = th.muted; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText(v + 's', ax, axisY2 + 10);
      ctx.strokeStyle = th.div; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(ax, axisY2); ctx.lineTo(ax, axisY2 + 3); ctx.stroke();
    });

    // "Done" markers
    if (progress >= 1) {
      var seqDoneX = LABEL_W + (SEQ_TOTAL / SCALE) * tlW;
      var parDoneX = LABEL_W + (PAR_TOTAL / SCALE) * tlW;
      [
        { x: seqDoneX, y: SEC_HEAD + secAY, color: '#ff6b6b' },
        { x: parDoneX, y: SEC_HEAD + secBY, color: '#4fc97e' },
      ].forEach(function(m) {
        ctx.strokeStyle = m.color; ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x, m.y + tasks.length * (ROW_H + ROW_GAP));
        ctx.stroke();
      });
    }
  }

  // Draw initial state
  drawTimeline(0);

  var animId = null;
  var running = false;

  playBtn.addEventListener('click', function() {
    if (running) return;
    badge.style.display = 'none';
    running = true;
    playBtn.textContent = '⏳ Running…';
    playBtn.disabled = true;

    var ANIM_DURATION = 2800; // ms
    var startTime = null;

    function frame(ts) {
      if (!startTime) startTime = ts;
      var elapsed = ts - startTime;
      var progress = Math.min(elapsed / ANIM_DURATION, 1);
      drawTimeline(progress);
      if (progress < 1) {
        animId = requestAnimationFrame(frame);
      } else {
        running = false;
        playBtn.textContent = '↺ Replay';
        playBtn.disabled = false;
        badge.style.display = 'flex';
      }
    }
    animId = requestAnimationFrame(frame);
  });

  window.addEventListener('resize', function() { drawTimeline(0); badge.style.display = 'none'; });
})();
</script>


## When to Use It: Seven Scenarios

<div class="par-usecases-grid">
  <div class="par-usecase-card">
    <span class="par-usecase-num">01</span>
    <h4>Information Gathering</h4>
    <p>Query multiple APIs simultaneously — news, stock data, social feeds, databases — instead of fetching them one by one.</p>
    <span class="par-usecase-gain">↑ 3–5× faster research agents</span>
  </div>
  <div class="par-usecase-card">
    <span class="par-usecase-num">02</span>
    <h4>Data Analysis</h4>
    <p>Run sentiment analysis, keyword extraction, categorization, and urgency scoring on the same batch of text — all at once.</p>
    <span class="par-usecase-gain">↑ Multi-faceted output in one pass</span>
  </div>
  <div class="par-usecase-card">
    <span class="par-usecase-num">03</span>
    <h4>Multi-API Orchestration</h4>
    <p>A travel agent checking flights, hotels, events, and restaurants simultaneously. Four calls, not four round-trips.</p>
    <span class="par-usecase-gain">↑ Complete plan, not a drip feed</span>
  </div>
  <div class="par-usecase-card">
    <span class="par-usecase-num">04</span>
    <h4>Content Generation</h4>
    <p>Generate subject line, body copy, image prompt, and CTA text for an email — in parallel, then assemble.</p>
    <span class="par-usecase-gain">↑ Faster creative pipelines</span>
  </div>
  <div class="par-usecase-card">
    <span class="par-usecase-num">05</span>
    <h4>Input Validation</h4>
    <p>Check email format, phone validity, address lookup, and profanity filter simultaneously — return all issues at once.</p>
    <span class="par-usecase-gain">↑ Sub-second validation feedback</span>
  </div>
  <div class="par-usecase-card">
    <span class="par-usecase-num">06</span>
    <h4>Multi-Modal Processing</h4>
    <p>Analyze the text and the image in a social post at the same time. Merge insights from both modalities at the end.</p>
    <span class="par-usecase-gain">↑ No wasted latency on modalities</span>
  </div>
  <div class="par-usecase-card">
    <span class="par-usecase-num">07</span>
    <h4>A/B Option Generation</h4>
    <p>Generate three different headlines simultaneously using slightly varied prompts. Pick the best one automatically.</p>
    <span class="par-usecase-gain">↑ More options, same wall-clock time</span>
  </div>
</div>

<style>
.par-usecases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.85rem;
  margin: 1.5rem 0;
}
.par-usecase-card {
  border: 1px solid var(--global-divider-color);
  border-radius: 8px;
  padding: 1rem;
  background: rgba(128,128,128,0.04);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.par-usecase-num {
  font-family: monospace;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #2698ba;
}
.par-usecase-card h4 {
  font-size: 0.85rem;
  font-weight: 700;
  margin: 0;
  color: var(--global-text-color);
}
.par-usecase-card p {
  font-size: 0.78rem;
  color: var(--global-text-color-light);
  margin: 0;
  line-height: 1.5;
}
.par-usecase-gain {
  font-size: 0.7rem;
  font-family: monospace;
  color: #4fc97e;
  margin-top: auto;
  padding-top: 0.35rem;
  border-top: 1px solid var(--global-divider-color);
}
</style>


## How It Actually Works: asyncio

Before writing any code, one important nuance needs to be addressed — because it trips up almost everyone.

**`asyncio` does not run code in parallel on multiple CPU cores.** It runs on a **single thread**, using Python's event loop.

Here's how it works:

```
Event Loop (single thread):
┌────────────────────────────────────────────────────────┐
│                                                        │
│  1. Start Task A (send HTTP request)                   │
│  2. While waiting for A's response:                    │
│     → Start Task B (send HTTP request)                 │
│     → Start Task C (send HTTP request)                 │
│  3. A's response arrives → resume Task A               │
│  4. B's response arrives → resume Task B               │
│  5. C's response arrives → resume Task C               │
│  6. All three done → proceed                           │
│                                                        │
└────────────────────────────────────────────────────────┘
```

The key word is **waiting**. When Task A is waiting for a network response, that's idle time — the CPU is doing nothing for Task A. The event loop fills that idle time by starting Task B and C.

This means:

| Scenario | asyncio helps? |
|---|---|
| Multiple API calls / network requests | **Yes** — I/O bound, lots of waiting |
| Multiple LLM calls (external API) | **Yes** — network I/O dominates |
| Heavy CPU computation (matrix ops) | **No** — CPU bound, no idle time to exploit |
| Reading many files | **Yes** — disk I/O has wait time |

For agentic AI — where tasks are overwhelmingly LLM API calls and web requests — **asyncio is exactly the right tool**. The Python GIL (Global Interpreter Lock) is largely irrelevant here because the threads aren't fighting for CPU; they're waiting for network.


## Watch It Run: A Live Demo

Click **Run** to see three researcher agents fire simultaneously, then converge into a synthesis step.

<div class="par-demo-wrapper">
  <div class="par-demo-header">
    <span class="par-demo-title">LIVE PARALLEL EXECUTION DEMO</span>
    <button class="par-demo-btn" id="parDemoRunBtn">▶ Run</button>
  </div>
  <div class="par-demo-body">
    <div class="par-demo-query" id="parDemoQuery">
      <span class="par-query-label">INPUT TOPIC</span>
      <span class="par-query-text">"Sustainable Technology Advancements"</span>
    </div>

    <div class="par-demo-arrow">▼ Fan-out: all three start simultaneously</div>

    <div class="par-demo-agents">
      <div class="par-agent-lane" id="parLane0">
        <div class="par-agent-header">
          <span class="par-agent-icon">⚡</span>
          <span class="par-agent-name">Renewable Energy</span>
          <span class="par-agent-badge" id="parBadge0">Idle</span>
        </div>
        <div class="par-agent-track">
          <div class="par-agent-fill" id="parFill0" style="width:0%"></div>
        </div>
        <div class="par-agent-output" id="parOut0" style="display:none">
          "Solar and wind capacity grew 40% YoY. Offshore wind now cost-competitive with gas in 12 markets."
        </div>
      </div>

      <div class="par-agent-lane" id="parLane1">
        <div class="par-agent-header">
          <span class="par-agent-icon">🚗</span>
          <span class="par-agent-name">EV Technology</span>
          <span class="par-agent-badge" id="parBadge1">Idle</span>
        </div>
        <div class="par-agent-track">
          <div class="par-agent-fill" id="parFill1" style="width:0%;background:#4fc97e"></div>
        </div>
        <div class="par-agent-output" id="parOut1" style="display:none">
          "Solid-state batteries on track for 2027 mass production. EV range now averages 380 km per charge."
        </div>
      </div>

      <div class="par-agent-lane" id="parLane2">
        <div class="par-agent-header">
          <span class="par-agent-icon">🌿</span>
          <span class="par-agent-name">Carbon Capture</span>
          <span class="par-agent-badge" id="parBadge2">Idle</span>
        </div>
        <div class="par-agent-track">
          <div class="par-agent-fill" id="parFill2" style="width:0%;background:#e6a817"></div>
        </div>
        <div class="par-agent-output" id="parOut2" style="display:none">
          "Direct air capture costs fell 30% in 2025. Three new gigaton-scale facilities began operations."
        </div>
      </div>
    </div>

    <div class="par-demo-synth" id="parDemoSynth">
      <div class="par-synth-header">
        <span class="par-synth-icon">⚙</span>
        <span class="par-synth-name">Synthesis Agent</span>
        <span class="par-agent-badge" id="parSynthBadge">Waiting for all researchers…</span>
      </div>
      <div class="par-synth-output" id="parSynthOut" style="display:none">
        <strong>## Summary of Sustainable Technology Advancements</strong><br><br>
        <strong>Renewable Energy:</strong> Solar and wind installations accelerated globally, with offshore wind becoming commercially viable across 12 new markets, driven by 40% annual capacity growth.<br><br>
        <strong>Electric Vehicles:</strong> Solid-state battery technology is approaching mass production readiness, with current EV fleets achieving an average range of 380 km — closing the gap with combustion vehicles.<br><br>
        <strong>Carbon Capture:</strong> Significant cost reductions in direct air capture technology have enabled industrial-scale deployments, with three gigaton-class facilities now operational as of 2025.
      </div>
    </div>

    <div class="par-demo-timing" id="parDemoTiming" style="display:none">
      <span>Sequential estimate: <strong>4.8s</strong></span>
      <span class="par-timing-divider">·</span>
      <span>Parallel actual: <strong>2.1s</strong></span>
      <span class="par-timing-divider">·</span>
      <span class="par-timing-win">2.3× faster</span>
    </div>
  </div>
</div>

<style>
.par-demo-wrapper {
  border: 1px solid var(--global-divider-color);
  border-radius: 10px;
  overflow: hidden;
  margin: 2rem 0;
}
.par-demo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.1rem;
  background: rgba(128,128,128,0.05);
  border-bottom: 1px solid var(--global-divider-color);
}
.par-demo-title {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--global-text-color);
}
.par-demo-btn {
  font-family: monospace;
  font-size: 0.72rem;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  border: 1px solid var(--global-divider-color);
  background: transparent;
  color: var(--global-text-color);
  cursor: pointer;
  transition: background 0.15s;
}
.par-demo-btn:hover { background: rgba(38,152,186,0.15); border-color:#2698ba; color:#2698ba; }
.par-demo-body { padding: 1rem 1.1rem; display: flex; flex-direction: column; gap: 0.9rem; }
.par-demo-query {
  border: 1px solid var(--global-divider-color);
  border-radius: 6px;
  padding: 0.6rem 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(128,128,128,0.04);
}
.par-query-label {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #2698ba;
  flex-shrink: 0;
}
.par-query-text {
  font-family: monospace;
  font-size: 0.8rem;
  color: var(--global-text-color);
}
.par-demo-arrow {
  font-size: 0.72rem;
  color: var(--global-text-color-light);
  text-align: center;
  letter-spacing: 0.04em;
}
.par-demo-agents {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}
@media (max-width: 580px) { .par-demo-agents { grid-template-columns: 1fr; } }
.par-agent-lane {
  border: 1px solid var(--global-divider-color);
  border-radius: 7px;
  padding: 0.75rem;
  background: rgba(128,128,128,0.03);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: border-color 0.3s;
}
.par-agent-lane.active { border-color: #2698ba; }
.par-agent-lane.done   { border-color: #4fc97e; }
.par-agent-header { display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; }
.par-agent-icon { font-size: 0.9rem; }
.par-agent-name {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--global-text-color);
  flex: 1;
}
.par-agent-badge {
  font-size: 0.6rem;
  font-family: monospace;
  padding: 0.1rem 0.4rem;
  border-radius: 3px;
  border: 1px solid var(--global-divider-color);
  color: var(--global-text-color-light);
  background: transparent;
  transition: all 0.3s;
}
.par-agent-badge.running { color: #2698ba; border-color: #2698ba; background: rgba(38,152,186,0.1); }
.par-agent-badge.done    { color: #4fc97e; border-color: #4fc97e; background: rgba(79,201,126,0.1); }
.par-agent-track {
  height: 6px;
  background: rgba(128,128,128,0.12);
  border-radius: 3px;
  overflow: hidden;
}
.par-agent-fill {
  height: 100%;
  width: 0%;
  background: #2698ba;
  border-radius: 3px;
  transition: width 0.05s linear;
}
.par-agent-output {
  font-size: 0.73rem;
  color: var(--global-text-color-light);
  line-height: 1.5;
  border-top: 1px solid var(--global-divider-color);
  padding-top: 0.45rem;
  margin-top: 0.1rem;
}
.par-demo-synth {
  border: 1px solid var(--global-divider-color);
  border-radius: 7px;
  padding: 0.75rem;
  background: rgba(128,128,128,0.03);
  opacity: 0.4;
  transition: opacity 0.4s, border-color 0.4s;
}
.par-demo-synth.active { opacity: 1; border-color: #c97af2; }
.par-demo-synth.done   { opacity: 1; border-color: #4fc97e; }
.par-synth-header { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.5rem; flex-wrap: wrap; }
.par-synth-icon { font-size: 0.9rem; }
.par-synth-name { font-size: 0.75rem; font-weight: 700; color: var(--global-text-color); flex: 1; }
.par-synth-output {
  font-size: 0.76rem;
  color: var(--global-text-color);
  line-height: 1.65;
  border-top: 1px solid var(--global-divider-color);
  padding-top: 0.6rem;
  margin-top: 0.4rem;
}
.par-demo-timing {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.78rem;
  color: var(--global-text-color-light);
  border-top: 1px solid var(--global-divider-color);
  padding-top: 0.65rem;
  margin-top: 0.2rem;
  flex-wrap: wrap;
}
.par-timing-divider { color: var(--global-divider-color); }
.par-timing-win { color: #4fc97e; font-weight: 700; }
</style>

<script>
(function(){
  var runBtn = document.getElementById('parDemoRunBtn');
  if (!runBtn) return;

  var lanes = [
    { fill: 'parFill0', badge: 'parBadge0', out: 'parOut0', lane: 'parLane0', dur: 1500 },
    { fill: 'parFill1', badge: 'parBadge1', out: 'parOut1', lane: 'parLane1', dur: 1200 },
    { fill: 'parFill2', badge: 'parBadge2', out: 'parOut2', lane: 'parLane2', dur: 900  },
  ];
  var synth = {
    el:    document.getElementById('parDemoSynth'),
    badge: document.getElementById('parSynthBadge'),
    out:   document.getElementById('parSynthOut'),
  };
  var timing = document.getElementById('parDemoTiming');

  function reset() {
    lanes.forEach(function(l) {
      document.getElementById(l.fill).style.width  = '0%';
      document.getElementById(l.badge).textContent = 'Idle';
      document.getElementById(l.badge).className   = 'par-agent-badge';
      document.getElementById(l.out).style.display = 'none';
      document.getElementById(l.lane).className    = 'par-agent-lane';
    });
    synth.el.className     = 'par-demo-synth';
    synth.badge.textContent = 'Waiting for all researchers…';
    synth.badge.className   = 'par-agent-badge';
    synth.out.style.display = 'none';
    timing.style.display    = 'none';
  }

  runBtn.addEventListener('click', function() {
    reset();
    runBtn.disabled = true;
    runBtn.textContent = '⏳ Running…';

    var allDone = 0;
    var maxDur = 0;
    lanes.forEach(function(l) { if (l.dur > maxDur) maxDur = l.dur; });

    lanes.forEach(function(l) {
      var fillEl  = document.getElementById(l.fill);
      var badgeEl = document.getElementById(l.badge);
      var outEl   = document.getElementById(l.out);
      var laneEl  = document.getElementById(l.lane);

      laneEl.className = 'par-agent-lane active';
      badgeEl.textContent = 'Running…';
      badgeEl.className   = 'par-agent-badge running';

      var startTs = null;
      function animFill(ts) {
        if (!startTs) startTs = ts;
        var pct = Math.min((ts - startTs) / l.dur * 100, 100);
        fillEl.style.width = pct + '%';
        if (pct < 100) {
          requestAnimationFrame(animFill);
        } else {
          laneEl.className    = 'par-agent-lane done';
          badgeEl.textContent = 'Done ✓';
          badgeEl.className   = 'par-agent-badge done';
          outEl.style.display = 'block';
          allDone++;
          if (allDone === lanes.length) startSynth();
        }
      }
      requestAnimationFrame(animFill);
    });

    function startSynth() {
      synth.el.className = 'par-demo-synth active';
      synth.badge.textContent = 'Synthesizing…';
      synth.badge.className   = 'par-agent-badge running';
      setTimeout(function() {
        synth.el.className = 'par-demo-synth done';
        synth.badge.textContent = 'Done ✓';
        synth.badge.className   = 'par-agent-badge done';
        synth.out.style.display  = 'block';
        timing.style.display     = 'flex';
        runBtn.disabled   = false;
        runBtn.textContent = '↺ Replay';
      }, 900);
    }
  });
})();
</script>


## The LangChain Way: `RunnableParallel`

LangChain implements parallelization through **`RunnableParallel`** — a construct that takes a dictionary of named chains and runs all of them at once, returning a dictionary of results.

```python
import os
import asyncio
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableParallel, RunnablePassthrough
```

> **Why these imports?**
> - `asyncio` — Python's built-in library for writing concurrent code using `async`/`await`
> - `ChatOpenAI` — the LangChain wrapper for OpenAI's chat models (swappable for any other provider)
> - `ChatPromptTemplate` — structures messages into `system` + `user` roles (what the model expects)
> - `StrOutputParser` — converts the raw message object from the LLM into a plain Python string
> - `RunnableParallel` — the key component that executes multiple chains *simultaneously*
> - `RunnablePassthrough` — passes the input through unchanged, so downstream steps can still access the original value

```python
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)
```

> `temperature=0.7` — a mid-range value. Lower (0.0) makes outputs deterministic and consistent; higher (1.0) adds creativity. For research summaries we want some flexibility, so 0.7 is appropriate.

### Defining Three Independent Chains

```python
summarize_chain = (
    ChatPromptTemplate.from_messages([
        ("system", "Summarize the following topic concisely:"),
        ("user",   "{topic}")
    ])
    | llm
    | StrOutputParser()
)

questions_chain = (
    ChatPromptTemplate.from_messages([
        ("system", "Generate three interesting questions about the following topic:"),
        ("user",   "{topic}")
    ])
    | llm
    | StrOutputParser()
)

terms_chain = (
    ChatPromptTemplate.from_messages([
        ("system", "Identify 5–10 key terms from the following topic, separated by commas:"),
        ("user",   "{topic}")
    ])
    | llm
    | StrOutputParser()
)
```

> Each chain is a complete pipeline: `prompt → LLM → string output`. They all take `{topic}` as input and return a string. None of them depend on each other's output — which makes them perfect candidates for parallel execution.

### Building the Parallel Block

```python
map_chain = RunnableParallel({
    "summary":    summarize_chain,
    "questions":  questions_chain,
    "key_terms":  terms_chain,
    "topic":      RunnablePassthrough(),   # ← keep the original input available downstream
})
```

> **How `RunnableParallel` works:** When you call `map_chain.invoke("space exploration")`:
> 1. LangChain sends `"space exploration"` to `summarize_chain`, `questions_chain`, `terms_chain`, and `RunnablePassthrough()` **at the same time**
> 2. Each chain runs concurrently (as async tasks in the event loop)
> 3. Once all four return, `RunnableParallel` packages their outputs into a single dictionary: `{"summary": "...", "questions": "...", "key_terms": "...", "topic": "space exploration"}`
>
> **Why `RunnablePassthrough()`?** The synthesis step needs the original topic text — not just the processed outputs. Without it, the original string would be consumed and discarded by the parallel step. `RunnablePassthrough()` passes the input through unchanged so the next step can reference it.

```
Data flow through map_chain:

Input: "space exploration"
        │
        ├──→ summarize_chain  ──→ "A summary of space exploration..."
        │
        ├──→ questions_chain  ──→ "1. What year... 2. Who... 3. Why..."
        │
        ├──→ terms_chain      ──→ "NASA, Apollo, orbit, rocket..."
        │
        └──→ RunnablePassthrough() ──→ "space exploration"
        
Output: { "summary": ..., "questions": ..., "key_terms": ..., "topic": ... }
```

### The Synthesis Step

```python
synthesis_prompt = ChatPromptTemplate.from_messages([
    ("system", """Based on the following information:
Summary: {summary}
Related Questions: {questions}
Key Terms: {key_terms}

Synthesize a comprehensive answer."""),
    ("user", "Original topic: {topic}")
])

full_parallel_chain = map_chain | synthesis_prompt | llm | StrOutputParser()
```

> The `|` pipe connects `map_chain`'s dictionary output directly into `synthesis_prompt`. LangChain automatically fills `{summary}`, `{questions}`, `{key_terms}`, and `{topic}` from the dictionary keys. This is why the dictionary keys in `RunnableParallel` must match the variable names in the synthesis prompt exactly.

### Running It Asynchronously

```python
async def run_parallel_example(topic: str) -> None:
    response = await full_parallel_chain.ainvoke(topic)
    print(response)

if __name__ == "__main__":
    asyncio.run(run_parallel_example("The history of space exploration"))
```

> **`ainvoke` vs `invoke`:** `ainvoke` is the async version. It allows the event loop to switch between the parallel tasks while they're waiting for API responses. Using the synchronous `invoke` would block the entire thread during each LLM call, serializing the "parallel" chains and defeating the purpose.
>
> **`asyncio.run()`:** This is the standard entry point for running async code from a synchronous context (like a script's `__main__` block). It creates an event loop, runs the coroutine, and then closes the loop.

### Full Data Flow

<div class="ns-diagram">
  <div class="ns-diagram-header">
    <span class="ns-diagram-label">LANGCHAIN PARALLEL DATA FLOW — one input, four simultaneous chains, one output</span>
    <button class="ns-expand-btn" onclick="openNsDiagram(this)"><svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 5V1h4M11 7v4H7M1 5l4-4M11 7l-4 4"/></svg> Expand</button>
  </div>
  <div class="ns-diagram-body" style="flex-direction:row;align-items:center;gap:0.75rem;padding:1.1rem 1.25rem;flex-wrap:nowrap;">
    <div class="ns-node ns-node-cyan" style="flex-shrink:0;max-width:140px;">
      <div class="ns-node-title">Topic String</div>
      <div class="ns-node-sub">"space exploration"</div>
    </div>
    <div style="color:#4a5a6a;font-size:1.2rem;">→</div>
    <div class="ns-node ns-node-purple" style="flex-shrink:0;max-width:160px;">
      <div class="ns-node-title">RunnableParallel</div>
      <div class="ns-node-sub">fans out to all chains at once</div>
    </div>
    <div style="color:#4a5a6a;font-size:1.2rem;">→</div>
    <div style="display:flex;flex-direction:column;gap:0.4rem;flex:1;min-width:140px;">
      <div class="ns-node"><div class="ns-node-title">summarize_chain</div></div>
      <div class="ns-node"><div class="ns-node-title">questions_chain</div></div>
      <div class="ns-node"><div class="ns-node-title">terms_chain</div></div>
      <div class="ns-node ns-node-dim"><div class="ns-node-title">RunnablePassthrough</div><div class="ns-node-sub">passes original topic through</div></div>
    </div>
    <div style="color:#4a5a6a;font-size:1.2rem;">→</div>
    <div class="ns-node ns-node-amber" style="flex-shrink:0;max-width:160px;">
      <div class="ns-node-title">Merged Dict</div>
      <div class="ns-node-sub">summary, questions, key_terms, topic</div>
    </div>
    <div style="color:#4a5a6a;font-size:1.2rem;">→</div>
    <div style="display:flex;flex-direction:column;gap:0.4rem;flex-shrink:0;min-width:120px;">
      <div class="ns-node"><div class="ns-node-title">synthesis_prompt</div></div>
      <div class="ns-node"><div class="ns-node-title">LLM</div></div>
      <div class="ns-node ns-node-green"><div class="ns-node-title">Final Output</div></div>
    </div>
  </div>
</div>


## The Google ADK Way: `ParallelAgent`

The Google ADK takes a different approach. Instead of wiring chains together, you define **agents** and declare their relationships using `ParallelAgent` and `SequentialAgent`. The framework handles the scheduling.

```python
from google.adk.agents import LlmAgent, ParallelAgent, SequentialAgent
from google.adk.tools import google_search

GEMINI_MODEL = "gemini-2.0-flash"
```

> **Why these imports?**
> - `LlmAgent` — a single agent powered by an LLM. You give it an instruction and optional tools.
> - `ParallelAgent` — an orchestrator that runs its `sub_agents` concurrently, waiting until all complete before proceeding.
> - `SequentialAgent` — an orchestrator that runs its `sub_agents` one after another. Used to chain the `ParallelAgent` with the synthesis agent.
> - `google_search` — a built-in ADK tool that gives agents access to live web search.

### Three Researcher Agents (the parallel workers)

```python
researcher_agent_1 = LlmAgent(
    name        = "RenewableEnergyResearcher",
    model       = GEMINI_MODEL,
    instruction = """You are a research assistant specializing in energy.
Research the latest advancements in 'renewable energy sources'.
Use the Google Search tool provided.
Summarize your key findings concisely (1–2 sentences).
Output *only* the summary.""",
    description = "Researches renewable energy sources.",
    tools       = [google_search],
    output_key  = "renewable_energy_result",   # ← stores result in session state
)
```

> **Why docstring-style instructions?** The ADK uses the `instruction` field as the agent's *system prompt*. Being explicit about:
> - What tool to use (`Use the Google Search tool`)
> - How much to write (`1–2 sentences`)
> - What to output (`Output *only* the summary`)
> …prevents the agent from adding preamble, caveats, or asking clarifying questions.
>
> **Why `output_key`?** This is how parallel agents share results. When `researcher_agent_1` finishes, it stores its output string into the session state under the key `"renewable_energy_result"`. The synthesis agent can then read from `{renewable_energy_result}` in its instruction template. Without `output_key`, the parallel agents' outputs would be lost.

Researchers 2 and 3 are identical in structure, covering EV technology (`output_key="ev_technology_result"`) and carbon capture (`output_key="carbon_capture_result"`).

### The ParallelAgent (runs all three at once)

```python
parallel_research_agent = ParallelAgent(
    name        = "ParallelWebResearchAgent",
    sub_agents  = [researcher_agent_1, researcher_agent_2, researcher_agent_3],
    description = "Runs multiple research agents in parallel to gather information.",
)
```

> This is the entire parallelization mechanism in ADK — just declare `sub_agents` inside a `ParallelAgent`. The framework:
> 1. Starts all three `LlmAgent`s concurrently
> 2. Each agent performs its search and writes its result to session state via `output_key`
> 3. `ParallelAgent` completes once **all** sub-agents have finished
>
> No async code, no event loop management, no callback hell — the framework handles all of it.

### The Synthesis Agent

```python
merger_agent = LlmAgent(
    name  = "SynthesisAgent",
    model = GEMINI_MODEL,
    instruction = """You are responsible for combining research findings into a structured report.

**Input Summaries:**
* Renewable Energy: {renewable_energy_result}
* Electric Vehicles: {ev_technology_result}
* Carbon Capture:   {carbon_capture_result}

**CRITICAL RULE:** Base your entire response *exclusively* on the Input Summaries above.
Do NOT add external knowledge not present in these summaries.

**Output Format:**
## Summary of Recent Sustainable Technology Advancements

### Renewable Energy Findings
[Synthesize only the renewable energy input summary]

### Electric Vehicle Findings
[Synthesize only the EV input summary]

### Carbon Capture Findings
[Synthesize only the carbon capture input summary]

### Overall Conclusion
[1–2 sentences connecting only the findings above]

Output *only* the structured report.""",
    description = "Combines research findings into a structured, cited report.",
)
```

> **Why `{renewable_energy_result}` in the instruction?** The ADK automatically fills these `{key}` placeholders from the session state. Since the three researcher agents stored their outputs under exactly these keys, the synthesis agent receives all three summaries injected directly into its prompt.
>
> **Why the "CRITICAL RULE"?** Without it, LLMs will use their pre-trained world knowledge to supplement the research, making the output non-deterministic and potentially inconsistent with what was actually found in the search. The explicit constraint forces the agent to stay grounded.

### The SequentialAgent (orchestrates everything)

```python
sequential_pipeline_agent = SequentialAgent(
    name        = "ResearchAndSynthesisPipeline",
    sub_agents  = [parallel_research_agent, merger_agent],
    description = "Coordinates parallel research and synthesizes the results.",
)

root_agent = sequential_pipeline_agent
```

> The `SequentialAgent` runs `parallel_research_agent` first (which internally runs the three researchers in parallel), waits for it to complete, then runs `merger_agent`. This gives you **parallelism where possible, sequencing where necessary** — exactly the right structure for fan-out / fan-in workflows.

### ADK Orchestration Flow

<div class="ns-diagram">
  <div class="ns-diagram-header">
    <span class="ns-diagram-label">ADK ORCHESTRATION FLOW</span>
    <button class="ns-expand-btn" onclick="openNsDiagram(this)"><svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 5V1h4M11 7v4H7M1 5l4-4M11 7l-4 4"/></svg> Expand</button>
  </div>
  <div class="ns-diagram-body" style="padding:1.25rem 1.5rem;">
    <div class="ns-node ns-node-cyan" style="max-width:200px;"><div class="ns-node-title">User Input</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node" style="max-width:200px;"><div class="ns-node-title">SequentialAgent</div><div class="ns-node-sub">orchestrates the whole flow</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-phase" style="max-width:480px;">
      <div class="ns-phase-title">ParallelAgent — all three fire simultaneously</div>
      <div class="ns-phase-sub">output_key writes each result to Session State</div>
      <div class="ns-row">
        <div class="ns-node ns-node-cyan"><div class="ns-node-title">Renewable Energy</div><div class="ns-node-sub">→ renewable_energy_result</div></div>
        <div class="ns-node ns-node-cyan"><div class="ns-node-title">EV Researcher</div><div class="ns-node-sub">→ ev_technology_result</div></div>
        <div class="ns-node ns-node-cyan"><div class="ns-node-title">Carbon Capture</div><div class="ns-node-sub">→ carbon_capture_result</div></div>
      </div>
    </div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-amber" style="max-width:260px;"><div class="ns-node-title">Session State</div><div class="ns-node-sub">fills template placeholders in Synthesis Agent's instruction</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-green" style="max-width:200px;"><div class="ns-node-title">Synthesis Agent</div><div class="ns-node-sub">merges all results into final report</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-green" style="max-width:200px;"><div class="ns-node-title">Structured Report</div></div>
  </div>
</div>


## Side by Side: LangChain vs ADK

| | LangChain (LCEL) | Google ADK |
|---|---|---|
| **Parallelism primitive** | `RunnableParallel` dict | `ParallelAgent` |
| **Sequencing primitive** | `\|` pipe operator | `SequentialAgent` |
| **How results are shared** | Dict keys flow through the pipeline | `output_key` writes to session state |
| **Async model** | `asyncio` via `ainvoke` / `astream` | Managed by ADK framework |
| **Code verbosity** | Lower — functional chain composition | Higher — agent class definitions |
| **Observability** | LangSmith tracing | ADK built-in tracing |
| **Best for** | Tight, composable chains where you control the data flow | Multi-agent systems where agents are independent workers |

The fundamental difference: **LangChain is data-flow** (inputs pipe through transforms), **ADK is agent-flow** (agents communicate via shared state). Both achieve parallelism, but the mental model is different.


## At a Glance

<div class="par-summary-card">
  <div class="par-summary-col">
    <div class="par-summary-label">WHAT</div>
    <p>Independent tasks that don't need each other's output are executed simultaneously instead of one at a time.</p>
  </div>
  <div class="par-summary-divider"></div>
  <div class="par-summary-col">
    <div class="par-summary-label">WHY</div>
    <p>Sequential execution adds all latencies together. Parallel execution takes only the longest. For I/O-bound work (API calls, LLM requests), this is a 2–5× speedup with zero additional cost.</p>
  </div>
  <div class="par-summary-divider"></div>
  <div class="par-summary-col">
    <div class="par-summary-label">RULE OF THUMB</div>
    <p>Use when a workflow contains multiple independent lookups, computations, or content-generation tasks that each produce a piece of a larger whole.</p>
  </div>
</div>

<style>
.par-summary-card {
  display: flex;
  gap: 0;
  border: 1px solid var(--global-divider-color);
  border-radius: 10px;
  overflow: hidden;
  margin: 1.5rem 0;
}
@media (max-width: 640px) { .par-summary-card { flex-direction: column; } }
.par-summary-col {
  flex: 1;
  padding: 1.1rem;
  background: rgba(128,128,128,0.03);
}
.par-summary-col p {
  font-size: 0.8rem;
  color: var(--global-text-color-light);
  line-height: 1.6;
  margin: 0.4rem 0 0;
}
.par-summary-divider {
  width: 1px;
  background: var(--global-divider-color);
  flex-shrink: 0;
}
.par-summary-label {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #2698ba;
}
</style>


## Key Takeaways

- **The core rule:** Tasks that don't depend on each other's output can run in parallel. Tasks that do must remain sequential.
- **The gain:** For I/O-bound work (LLM calls, API requests, database queries), parallelism reduces total time from `sum of all durations` to `max of parallel durations + sequential tail`.
- **`asyncio` is concurrency, not CPU parallelism.** It works by filling idle network-wait time with other tasks. This is exactly what agentic workflows need.
- **LangChain uses `RunnableParallel`** — wrap a dictionary of chains and the LCEL runtime fires them all concurrently, collecting results into a dict for the next step.
- **ADK uses `ParallelAgent`** — declare sub-agents in a `ParallelAgent`, use `output_key` to write results to session state, and a downstream synthesis agent reads from state via `{key}` placeholders in its instruction.
- **The synthesis step is always sequential.** Parallelization is a fan-out / fan-in pattern: spread out, work in parallel, reconverge.
- **Added complexity is real.** Parallel workflows are harder to debug, log, and reason about than sequential ones. Use it when the latency gain is significant — not as a default architecture.


*Next up — Chapter 4: Orchestration, where we combine chaining, routing, and parallelization into full multi-agent systems.*

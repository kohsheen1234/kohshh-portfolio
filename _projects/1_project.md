---
layout: page
title: SigmaLoop
description: A self-improving agent loop that autonomously optimizes coding agents through continuous iteration, failure analysis, and gated evaluation — no model upgrades required.
img:
importance: 1
category: work
github: https://github.com/kohsheen1234/sigmaloop
---

<style>
.sl-card{background:#0d1117;border:1px solid #30363d;border-radius:12px;padding:28px 24px;margin:36px 0;overflow-x:auto}
.sl-card-title{color:#e6edf3;text-transform:uppercase;letter-spacing:2px;font-size:13px;font-weight:700;margin-bottom:20px;text-align:center}
.sl-caption{color:#8b949e;font-style:italic;font-size:13px;margin-top:18px;line-height:1.7}
.sl-legend{display:flex;flex-wrap:wrap;gap:18px;margin-top:16px;justify-content:center}
.sl-legend-item{display:flex;align-items:center;gap:7px;color:#8b949e;font-size:12px}
.sl-legend-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.sl-legend-dot.kept{background:#3fb950}
.sl-legend-dot.disc-val{background:#f85149}
.sl-legend-dot.disc-reg{background:transparent;border:2px dashed #f85149;width:8px;height:8px}

/* Flowchart */
.sl-flow{display:flex;flex-direction:column;align-items:center;gap:0;padding:10px 0}
.sl-flow-arrow{color:#484f58;font-size:22px;line-height:1;margin:6px 0}
.sl-flow-node{background:#161b22;border:1.5px solid #30363d;border-radius:8px;padding:14px 22px;text-align:center;color:#c9d1d9;font-size:13px;max-width:520px;width:100%}
.sl-flow-node small{color:#8b949e;display:block;margin-top:4px;font-size:11.5px}
.sl-flow-node.start{border-color:#58a6ff;background:#161b22}
.sl-flow-node.end{border-radius:24px;border-color:#484f58;background:#161b22}
.sl-phase-label{font-size:14px;font-weight:700;margin-bottom:8px;text-align:left;width:100%;max-width:520px}
.sl-phase-label span{font-size:11px;font-weight:400;color:#8b949e;margin-left:6px}

/* Gate detail box */
.sl-gate-box{background:#0d1117;border:1.5px solid #30363d;border-radius:8px;padding:14px 22px;text-align:center;color:#c9d1d9;font-size:13px;max-width:520px;width:100%;margin-top:6px}
.sl-gate-box small{color:#8b949e;display:block;margin-top:3px;font-size:11.5px}
.sl-gate-paths{display:flex;gap:16px;justify-content:center;margin-top:6px;width:100%;max-width:520px}
.sl-gate-path{flex:1;border-radius:8px;padding:10px 14px;text-align:center;font-size:12px}
.sl-gate-fail{background:rgba(248,81,73,0.08);border:1.5px dashed #f85149;color:#f85149}
.sl-gate-pass{background:rgba(63,185,80,0.08);border:1.5px dashed #3fb950;color:#3fb950}
.sl-gate-path small{display:block;margin-top:3px;font-size:11px;opacity:0.8}
.sl-retry-row{display:flex;gap:16px;justify-content:center;margin-top:6px;width:100%;max-width:520px}
.sl-retry-box{flex:1;background:#161b22;border:1.5px dashed #f85149;border-radius:8px;padding:8px 12px;text-align:center;color:#f85149;font-size:12px}
.sl-retry-box small{display:block;margin-top:2px;font-size:10.5px;color:#8b949e}
.sl-merge-dot{width:12px;height:12px;border:2px solid #484f58;border-radius:50%;background:#0d1117;margin:6px auto}

/* Cluster timeline */
.sl-timeline{width:100%;border-collapse:collapse;font-size:12px;min-width:700px}
.sl-timeline th{color:#8b949e;padding:8px 4px;text-align:center;font-weight:600;font-size:11px;border-bottom:1px solid #21262d;white-space:nowrap}
.sl-timeline th:first-child{text-align:left;padding-left:12px}
.sl-timeline th:last-child{text-align:right;padding-right:12px}
.sl-timeline td{padding:7px 4px;text-align:center;color:#c9d1d9;border-bottom:1px solid rgba(33,38,45,0.5)}
.sl-timeline td:first-child{text-align:left;padding-left:12px;color:#e6edf3;font-size:12px;white-space:nowrap}
.sl-timeline td:last-child{text-align:right;padding-right:12px;font-size:11px;font-weight:600}
.sl-tl-new{display:inline-block;background:rgba(248,81,73,0.15);color:#f85149;font-size:10px;font-weight:700;padding:2px 5px;border-radius:4px}
.sl-tl-count{color:#8b949e;font-size:11px}
.sl-tl-partial{display:inline-block;background:rgba(210,168,34,0.15);color:#d29922;font-size:10px;padding:2px 5px;border-radius:4px}
.sl-tl-resolved{display:inline-block;background:rgba(63,185,80,0.12);color:#3fb950;font-size:12px;padding:1px 4px;border-radius:4px}
.sl-status-resolved{color:#3fb950}
.sl-status-active{color:#58a6ff}

/* Chart containers */
.sl-chart-wrap{position:relative;width:100%}
.sl-chart-wrap svg{display:block;width:100%;height:auto}

/* Results grid */
.sl-results-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:24px 0}
.sl-result-item{background:#161b22;border:1px solid #30363d;border-radius:8px;padding:20px 16px;text-align:center}
.sl-card .sl-result-value{font-size:32px;font-weight:700;line-height:1.2;color:#e6edf3 !important;background:none !important}
.sl-card .sl-result-value.green{color:#3fb950 !important}
.sl-card .sl-result-value.red{color:#f85149 !important}
.sl-card .sl-result-label{color:#8b949e !important;font-size:11px;margin-top:6px;text-transform:uppercase;letter-spacing:1px;background:none !important}
@media(max-width:600px){.sl-results-grid{grid-template-columns:1fr}}
</style>

Engineering is shifting. The job is no longer writing software — it's maintaining systems that can observe their own failures, evolve their own quality layer, and improve their own operating harness over time.

Code generation is cheap. Modern coding systems can produce thousands of lines of working code in minutes, faster than any team can review, test, or fully understand. The bottleneck has moved. It is no longer writing code. It is everything that comes after: validating behavior, catching regressions, debugging failures, and maintaining reliability as systems evolve and user behaviors drift.

Unlike traditional software, where failures are deterministic and localized, agent systems fail in ways that are stochastic, distribution-dependent, and difficult to reproduce. Small changes in prompts, tool schemas, or context construction can lead to qualitatively different behaviors with compounding downstream consequences. Improvements are reactive. Complexity compounds. Over time, the system becomes harder to maintain.

## What SigmaLoop Does

SigmaLoop addresses this by transforming raw failure signals into a structured improvement pipeline. You give it a benchmark and a single file to edit. It reads failure traces, clusters them by root cause, tightens the system prompt and agent architecture, gates every change against a self-maintained regression suite, and repeats — overnight, unattended, no human in the loop.

Each failure is analyzed to produce a representation of what went wrong, along with a hypothesis about its root cause. Failures are converted into reusable evaluation cases. The system proposes targeted changes to the agent harness, applies them, and validates the outcome against an evolving evaluation set. Every failure contributes to a persistent improvement rather than being resolved as a one-off fix.

## The Self-Improvement Loop

<div class="sl-card">
<div class="sl-card-title">The Self-Improvement Loop</div>
<div class="sl-flow">

<div class="sl-flow-node start">Simulate batch of production traffic<small>From benchmark real-world request distribution</small></div>
<div class="sl-flow-arrow">↓</div>

<div class="sl-phase-label" style="color:#58a6ff">Phase A — Failure Mining<span>Scan traces · Classify root causes · Surface dominant patterns</span></div>
<div class="sl-flow-node" style="border-color:#58a6ff">Scan execution traces from failed tasks<small>Extract structured failure records — what failed, why, and what the agent should have done differently</small></div>
<div class="sl-flow-arrow">↓</div>

<div class="sl-phase-label" style="color:#bc8cff">Phase B — Eval Candidates &amp; Clustering<span>Track failures · Cluster by shared root-cause · Rerank by recurrence &amp; severity</span></div>
<div class="sl-flow-node" style="border-color:#bc8cff">Group failures by shared root-cause mechanism into clusters<small>Prioritize by high failure count and low resolution rate — optimization happens at the cluster level</small></div>
<div class="sl-flow-arrow">↓</div>

<div class="sl-phase-label" style="color:#3fb950">Phase C — Optimization Loop<span>[fixed iteration budget]</span></div>
<div class="sl-flow-node" style="border-color:#3fb950">Analyze failure patterns · Propose &amp; implement harness change<small>Targeted fix addressing root-cause cluster</small></div>
<div class="sl-flow-arrow">↓</div>
<div class="sl-gate-box">Regression Gate<small>regression ≥ 80% &amp; val_score ≥ best_seen</small></div>
<div class="sl-gate-paths">
<div class="sl-gate-path sl-gate-fail">FAIL<small>Try different approach</small></div>
<div class="sl-gate-path sl-gate-pass">PASS<small>Failures resolved</small></div>
</div>
<div class="sl-retry-row">
<div class="sl-retry-box">↺ retry loop<small>back to analyze</small></div>
<div class="sl-retry-box">Budget exhausted<small>exit anyway</small></div>
</div>
<div class="sl-merge-dot"></div>
<div class="sl-flow-arrow">↓</div>

<div class="sl-phase-label" style="color:#f0883e">Phase D — Regression Set Maintenance<span>Promote resolved failures to regression suite · Outcome recorded · Batch advances</span></div>
<div class="sl-flow-node" style="border-color:#f0883e">Promote resolved failures into regression suite<small>Each fix becomes a permanent constraint — future changes must keep passing them</small></div>
<div class="sl-flow-arrow">↓</div>

<div class="sl-flow-node end">Next batch ↺</div>

</div>
</div>

## How Each Phase Works

**Phase A — Failure Mining.** After each batch, the system scans execution traces from failed tasks and extracts structured failure records. It answers the central questions: what is the root cause of each failure? What failure patterns keep recurring? What should the agent have done differently? No manual labeling is required.

**Phase B — Clustering & Prioritization.** Failed tasks are grouped by shared root-cause mechanism into clusters. High failure count and low resolution rate identify the most systemic and unaddressed failure modes. Rather than treating failures independently, the system tracks and prioritizes them at the level of underlying patterns — enabling more efficient coverage of the error space.

**Phase C — Optimization Loop.** Within a fixed iteration budget, the system proposes targeted harness changes addressing root-cause clusters. Changes span the full stack: prompt design, few-shot examples, tool interfaces, context construction, and workflow architecture. Each proposed change runs through a three-step gate:

1. **Regression suite** — Previously fixed tasks must keep passing at ≥ 80% threshold. This is the system's memory.
2. **Full benchmark** — Mean reward on the held-out test split must meet or exceed the best score on record.
3. **Suite promotion** — If both gates pass, newly-passing tasks are promoted into the regression suite.

Nothing is committed without clearing all three steps. If any step fails, the change is reverted and the system tries a different approach.

**Phase D — Regression Suite Maintenance.** The regression set is not a static benchmark — it's a living collection of cases that evolves with the agent. Resolved failures are permanently encoded into the suite. Each improvement cycle makes it harder to accidentally regress, forcing each subsequent improvement to be genuinely additive.

## Results

SigmaLoop ran completely autonomously for 18 batches, executing 96 harness experiments with a fixed GPT-4 model. No fine-tuning, no model upgrade — all gains come purely from agent harness improvements. The underlying model is intentionally fixed to isolate gains from the system itself.

<div class="sl-card">
<div class="sl-results-grid">
<div class="sl-result-item"><div class="sl-result-value">0.560</div><div class="sl-result-label">Baseline val_score</div></div>
<div class="sl-result-item"><div class="sl-result-value green">0.780</div><div class="sl-result-label">Final val_score</div></div>
<div class="sl-result-item"><div class="sl-result-value green">+39.3%</div><div class="sl-result-label">Improvement</div></div>
<div class="sl-result-item"><div class="sl-result-value red">85%</div><div class="sl-result-label">Rejection rate</div></div>
</div>
</div>

### Agent Performance

<div class="sl-card">
<div class="sl-card-title">Agent Performance</div>
<div class="sl-chart-wrap" id="sl-perf"></div>
<div class="sl-legend">
<div class="sl-legend-item"><div class="sl-legend-dot kept"></div>kept</div>
<div class="sl-legend-item"><div class="sl-legend-dot disc-val"></div>discarded (val score not improved)</div>
<div class="sl-legend-item"><div class="sl-legend-dot disc-reg"></div>discarded (reg gate failed)</div>
</div>
<p class="sl-caption">Agent performance on the validation set improves from 0.56 → 0.78 over 96 iterations of harness optimization. At each iteration, the system explores multiple candidate updates, retaining only those that both improve validation performance and satisfy the regression gate (≥ 80%). In later stages, most candidate changes are rejected as the regression gate prevents any update that reintroduces previously fixed failure modes. As experiments progress, the optimization problem becomes harder, forcing each improvement to be additive — shifting reliability from a manual debugging loop to an automated improvement process.</p>
</div>

### Failure Cluster Discovery

<div class="sl-card">
<div class="sl-card-title">Cluster Resolution Timeline</div>
<div style="overflow-x:auto">
<table class="sl-timeline">
<thead>
<tr>
<th style="min-width:190px">CLUSTER</th>
<th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th><th>11</th><th>12</th><th>13</th><th>14</th><th>15</th><th>16</th><th>17</th><th>18</th>
<th style="min-width:90px">STATUS</th>
</tr>
</thead>
<tbody>
<tr>
<td>Wrong order identification</td>
<td></td><td></td><td></td><td><span class="sl-tl-new">+1</span></td><td><span class="sl-tl-new">+1</span></td><td><span class="sl-tl-partial">50%</span></td><td><span class="sl-tl-count">2</span></td><td><span class="sl-tl-count">2</span></td><td><span class="sl-tl-count">2</span></td><td><span class="sl-tl-count">2</span></td><td><span class="sl-tl-resolved">&#10003;</span></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
<td class="sl-status-resolved">Fully resolved</td>
</tr>
<tr>
<td>Product variant mismatch</td>
<td></td><td><span class="sl-tl-new">+1</span></td><td></td><td></td><td></td><td><span class="sl-tl-count">1</span></td><td><span class="sl-tl-count">1</span></td><td><span class="sl-tl-count">1</span></td><td><span class="sl-tl-count">1</span></td><td><span class="sl-tl-resolved">&#10003;</span></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
<td class="sl-status-resolved">Fully resolved</td>
</tr>
<tr>
<td>Roaming/data limit handling</td>
<td></td><td></td><td></td><td><span class="sl-tl-new">+1</span></td><td></td><td></td><td><span class="sl-tl-count">1</span></td><td><span class="sl-tl-count">1</span></td><td><span class="sl-tl-count">1</span></td><td><span class="sl-tl-resolved">&#10003;</span></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
<td class="sl-status-resolved">Fully resolved</td>
</tr>
<tr>
<td>Cabin downgrade payment confusion</td>
<td></td><td></td><td></td><td></td><td></td><td></td><td></td><td><span class="sl-tl-new">+1</span></td><td></td><td></td><td><span class="sl-tl-resolved">&#10003;</span></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
<td class="sl-status-resolved">Fully resolved</td>
</tr>
<tr>
<td>Cheapest flight not selected</td>
<td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td><span class="sl-tl-new">+1</span></td><td><span class="sl-tl-resolved">&#10003;</span></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
<td class="sl-status-resolved">Fully resolved</td>
</tr>
<tr>
<td>Tool dispatch errors</td>
<td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td><span class="sl-tl-new">+1</span></td><td><span class="sl-tl-count">1</span></td><td><span class="sl-tl-count">1</span></td><td><span class="sl-tl-count">1</span></td><td><span class="sl-tl-count">1</span></td><td></td><td></td><td></td><td><span class="sl-tl-resolved">&#10003;</span></td><td></td>
<td class="sl-status-resolved">Fully resolved</td>
</tr>
<tr>
<td>Insurance scope misapplied</td>
<td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td><span class="sl-tl-new">+1</span></td><td><span class="sl-tl-count">1</span></td><td><span class="sl-tl-count">1</span></td><td><span class="sl-tl-count">1</span></td><td><span class="sl-tl-count">1</span></td><td><span class="sl-tl-count">1</span></td><td></td><td></td><td></td>
<td class="sl-status-active">Active</td>
</tr>
<tr>
<td>Device reboot sequencing</td>
<td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td><span class="sl-tl-new">+1</span></td><td><span class="sl-tl-count">1</span></td><td><span class="sl-tl-count">1</span></td><td><span class="sl-tl-count">1</span></td><td><span class="sl-tl-count">1</span></td><td></td><td></td><td></td>
<td class="sl-status-active">Active</td>
</tr>
<tr>
<td>State tracking gaps</td>
<td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td><span class="sl-tl-new">+1</span></td><td><span class="sl-tl-count">1</span></td><td><span class="sl-tl-count">1</span></td><td><span class="sl-tl-count">1</span></td><td><span class="sl-tl-count">1</span></td><td></td><td></td>
<td class="sl-status-active">Active</td>
</tr>
<tr>
<td>Multi-order context confusion</td>
<td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td><span class="sl-tl-new">+1</span></td><td><span class="sl-tl-count">1</span></td><td><span class="sl-tl-count">1</span></td><td><span class="sl-tl-count">1</span></td><td><span class="sl-tl-count">1</span></td><td><span class="sl-tl-resolved">&#10003;</span></td>
<td class="sl-status-resolved">Fully resolved</td>
</tr>
</tbody>
</table>
</div>
<div class="sl-legend" style="margin-top:14px">
<div class="sl-legend-item"><span style="display:inline-block;width:10px;height:10px;background:#8b949e;border-radius:2px"></span> total failures</div>
<div class="sl-legend-item"><span class="sl-tl-new" style="font-size:9px">+1</span> new failure detected</div>
<div class="sl-legend-item"><span class="sl-tl-partial" style="font-size:9px">50%</span> partially resolved</div>
<div class="sl-legend-item"><span class="sl-tl-resolved" style="font-size:9px">&#10003;</span> fully resolved</div>
</div>
<p class="sl-caption">SigmaLoop automatically discovered 29+ distinct failure clusters from execution traces, without any manual labeling. Failures are treated as recurring patterns rather than isolated incidents. As clusters are resolved, they are incorporated into the regression set, preventing recurrence. High-impact failure modes are systematically identified, prioritized, and driven toward resolution.</p>
</div>

### Regression Set Evolution

<div class="sl-card">
<div class="sl-card-title">Regression Set Evolution</div>
<div class="sl-chart-wrap" id="sl-reg"></div>
<div class="sl-legend">
<div class="sl-legend-item"><span style="display:inline-block;width:20px;height:3px;background:#e6edf3;vertical-align:middle;border-radius:1px"></span> suite size (test cases)</div>
<div class="sl-legend-item"><div class="sl-legend-dot disc-val"></div> regression gating for discarded iterations</div>
</div>
<p class="sl-caption">The regression suite grows from 0 to 17 test cases across 18 batches, with each resolved failure cluster contributing new cases. The ≥ 80% gate is enforced throughout, rejecting any iteration that regresses on known failures. The evaluation set is not static — it evolves with the system. Each fix becomes a permanent constraint, making future improvements harder but more reliable, and ensuring progress compounds without backsliding.</p>
</div>

## Design Principles

**One file to edit, everything else locked.** The coding agent only touches `agent/agent.py`. The benchmark runner, gate logic, and recording infrastructure are immutable from the agent's perspective. This separation gives the loop a stable contract: change the agent, measure the change, gate the change.

**The regression suite is a memory of every fix.** Each committed improvement promotes newly-fixed tasks into `suite.json`. Future changes must keep passing them — or get rejected. The suite grows tighter over time, functioning as a living proxy validation set.

**Learnings survive session boundaries.** After every iteration, the agent writes to `workspace/learnings.md`: what it tried, what the failure pattern was, what worked. Reading this at session start restores full context without re-running diagnostics.

**High rejection rate is the goal.** The gate's job is to catch changes that overfit or regress. If the acceptance rate is high, the gate is too loose. In this experiment, 85% of changes were rejected — and every accepted commit was a real, generalizing improvement.

**Benchmark-agnostic architecture.** While the reference implementation uses [tau2](https://github.com/sierra-research/tau2-bench), the loop, gate, and recording layer are entirely decoupled. Subclass `BenchmarkRunner`, return `{task_id: reward}`, and the rest works unchanged.

Agent improvement is a search problem with many rejected paths. SigmaLoop provides the infrastructure — the loop, the gate, and the memory — so the agent can navigate that space autonomously.

<script>
(function(){
  var ns='http://www.w3.org/2000/svg';
  function el(tag,attrs){var e=document.createElementNS(ns,tag);if(attrs)Object.keys(attrs).forEach(function(k){e.setAttribute(k,attrs[k])});return e}
  function txt(tag,attrs,text){var e=el(tag,attrs);e.textContent=text;return e}

  /* ─── Agent Performance Chart ─── */
  (function(){
    var box=document.getElementById('sl-perf');if(!box)return;
    var W=900,H=420,ml=60,mr=20,mt=30,mb=50;
    var pw=W-ml-mr,ph=H-mt-mb;
    function sx(v){return ml+(v/95)*pw}
    function sy(v){return mt+ph-((v-0.45)/0.35)*ph}

    var svg=el('svg',{viewBox:'0 0 '+W+' '+H,preserveAspectRatio:'xMidYMid meet'});

    /* Grid */
    [0.50,0.55,0.60,0.65,0.70,0.75,0.80].forEach(function(v){
      svg.appendChild(el('line',{x1:ml,y1:sy(v),x2:W-mr,y2:sy(v),stroke:'#21262d','stroke-width':'1'}));
      svg.appendChild(txt('text',{x:ml-8,y:sy(v)+4,fill:'#8b949e','font-size':'11','text-anchor':'end','font-family':'system-ui,sans-serif'},v.toFixed(2)));
    });
    [0,10,20,30,40,50,60,70,80,90].forEach(function(v){
      svg.appendChild(txt('text',{x:sx(v),y:H-mb+22,fill:'#8b949e','font-size':'11','text-anchor':'middle','font-family':'system-ui,sans-serif'},v.toString()));
    });
    svg.appendChild(txt('text',{x:'15',y:(H/2).toString(),fill:'#8b949e','font-size':'12','text-anchor':'middle','font-family':'system-ui,sans-serif',transform:'rotate(-90,15,'+(H/2)+')'},'val score'));
    svg.appendChild(txt('text',{x:(W/2).toString(),y:(H-5).toString(),fill:'#8b949e','font-size':'12','text-anchor':'middle','font-family':'system-ui,sans-serif'},'experiment'));

    /* Threshold line */
    svg.appendChild(el('line',{x1:ml,y1:sy(0.80),x2:W-mr,y2:sy(0.80),stroke:'#484f58','stroke-width':'1','stroke-dasharray':'6,4'}));
    svg.appendChild(txt('text',{x:(ml+5).toString(),y:(sy(0.80)-6).toString(),fill:'#8b949e','font-size':'10','font-family':'system-ui,sans-serif'},'0.8 regression gate threshold'));

    /* Data */
    var kept=[[0,0.56],[2,0.56],[3,0.56],[5,0.56],[10,0.58],[13,0.58],[33,0.58],[34,0.58],[47,0.63],[49,0.64],[50,0.64],[52,0.64],[53,0.64],[93,0.78]];
    var discVal=[[1,0.52],[4,0.51],[6,0.54],[7,0.50],[8,0.49],[9,0.53],[11,0.52],[12,0.48],[14,0.53],[15,0.50],[16,0.51],[17,0.49],[18,0.55],[19,0.52],[20,0.50],[21,0.53],[22,0.48],[23,0.51],[24,0.54],[25,0.49],[26,0.52],[27,0.50],[28,0.53],[29,0.48],[30,0.51],[31,0.49],[32,0.52],[35,0.50],[36,0.53],[37,0.48],[38,0.51],[39,0.54],[40,0.49],[41,0.52],[42,0.50],[43,0.47],[44,0.51],[45,0.53],[46,0.50],[48,0.55],[51,0.58],[54,0.55],[55,0.52],[56,0.57],[57,0.54],[60,0.53],[65,0.49],[70,0.55],[75,0.51],[85,0.53],[90,0.58]];
    var discReg=[[58,0.50],[59,0.56],[61,0.55],[62,0.48],[63,0.51],[64,0.54],[66,0.52],[67,0.56],[68,0.50],[69,0.53],[71,0.52],[72,0.58],[73,0.49],[74,0.54],[76,0.56],[77,0.48],[78,0.53],[79,0.50],[80,0.55],[81,0.52],[82,0.57],[83,0.49],[84,0.54],[86,0.56],[87,0.53],[88,0.50],[89,0.55],[91,0.52],[92,0.54],[94,0.56],[95,0.53]];

    /* Kept line (staircase) */
    var d='M '+sx(kept[0][0])+' '+sy(kept[0][1]);
    for(var i=1;i<kept.length;i++){
      d+=' L '+sx(kept[i][0])+' '+sy(kept[i-1][1]);
      d+=' L '+sx(kept[i][0])+' '+sy(kept[i][1]);
    }
    svg.appendChild(el('path',{d:d,fill:'none',stroke:'#3fb950','stroke-width':'2',opacity:'0.6'}));

    /* Discarded val dots */
    discVal.forEach(function(p){svg.appendChild(el('circle',{cx:sx(p[0]),cy:sy(p[1]),r:'3.5',fill:'#f85149',opacity:'0.6'}))});

    /* Discarded reg dots (dashed hollow) */
    discReg.forEach(function(p){svg.appendChild(el('circle',{cx:sx(p[0]),cy:sy(p[1]),r:'3.5',fill:'none',stroke:'#f85149','stroke-width':'1.5','stroke-dasharray':'2,2',opacity:'0.6'}))});

    /* Kept dots */
    kept.forEach(function(p){svg.appendChild(el('circle',{cx:sx(p[0]),cy:sy(p[1]),r:'5.5',fill:'#3fb950',stroke:'#0d1117','stroke-width':'2'}))});

    /* Labels for key milestones */
    [[10,0.58,'0.580'],[47,0.63,'0.630'],[49,0.64,'0.640'],[93,0.78,'0.780']].forEach(function(m){
      var px=sx(m[0]),py=sy(m[1])-16;
      svg.appendChild(el('rect',{x:px-22,y:py-11,width:'44',height:'18',rx:'4',fill:'rgba(63,185,80,0.15)'}));
      svg.appendChild(txt('text',{x:px,y:py+2,fill:'#3fb950','font-size':'11','text-anchor':'middle','font-weight':'700','font-family':'system-ui,sans-serif'},m[2]));
    });

    box.appendChild(svg);
  })();

  /* ─── Regression Set Evolution Chart ─── */
  (function(){
    var box=document.getElementById('sl-reg');if(!box)return;
    var W=900,H=360,ml=60,mr=20,mt=30,mb=50;
    var pw=W-ml-mr,ph=H-mt-mb;
    function sx(v){return ml+((v-1)/17)*pw}
    function sy(v){return mt+ph-(v/17)*ph}

    var svg=el('svg',{viewBox:'0 0 '+W+' '+H,preserveAspectRatio:'xMidYMid meet'});

    /* Grid */
    [0,5,10,15,17].forEach(function(v){
      svg.appendChild(el('line',{x1:ml,y1:sy(v),x2:W-mr,y2:sy(v),stroke:'#21262d','stroke-width':'1'}));
      svg.appendChild(txt('text',{x:ml-8,y:sy(v)+4,fill:'#8b949e','font-size':'11','text-anchor':'end','font-family':'system-ui,sans-serif'},v.toString()));
    });
    for(var b=1;b<=18;b++){
      svg.appendChild(txt('text',{x:sx(b),y:H-mb+22,fill:'#8b949e','font-size':'11','text-anchor':'middle','font-family':'system-ui,sans-serif'},b.toString()));
    }
    svg.appendChild(txt('text',{x:'15',y:(H/2).toString(),fill:'#8b949e','font-size':'12','text-anchor':'middle','font-family':'system-ui,sans-serif',transform:'rotate(-90,15,'+(H/2)+')'},'test cases'));
    svg.appendChild(txt('text',{x:(W/2).toString(),y:(H-5).toString(),fill:'#8b949e','font-size':'12','text-anchor':'middle','font-family':'system-ui,sans-serif'},'batch'));

    /* Suite growth data: [batch, suite_size] */
    var suite=[[1,0],[2,1],[3,1],[4,1],[5,1],[6,2],[7,2],[8,2],[9,2],[10,7],[11,10],[12,12],[13,12],[14,12],[15,12],[16,12],[17,17],[18,17]];

    /* Step line */
    var d='M '+sx(suite[0][0])+' '+sy(suite[0][1]);
    for(var i=1;i<suite.length;i++){
      d+=' L '+sx(suite[i][0])+' '+sy(suite[i-1][1]);
      d+=' L '+sx(suite[i][0])+' '+sy(suite[i][1]);
    }
    svg.appendChild(el('path',{d:d,fill:'none',stroke:'#e6edf3','stroke-width':'2'}));

    /* Step dots */
    suite.forEach(function(s){svg.appendChild(el('circle',{cx:sx(s[0]),cy:sy(s[1]),r:'4',fill:'#e6edf3',stroke:'#0d1117','stroke-width':'2'}))});

    /* Growth annotations */
    [[2,1,'+1'],[6,2,'+1'],[10,7,'+5'],[11,10,'+3'],[12,12,'+2'],[17,17,'+5']].forEach(function(a){
      var px=sx(a[0]),py=sy(a[1])-20;
      svg.appendChild(el('rect',{x:px-14,y:py-11,width:'28',height:'18',rx:'4',fill:'#161b22',stroke:'#30363d','stroke-width':'1'}));
      svg.appendChild(txt('text',{x:px,y:py+2,fill:'#e6edf3','font-size':'10','text-anchor':'middle','font-weight':'600','font-family':'system-ui,sans-serif'},a[2]));
    });

    /* Rejection dots (reg gate catches) scattered below suite line in later batches */
    var rej=[[7,0],[7,1],[8,0],[8,0],[8,1],[9,1],[9,0],[9,1],[9,2],[10,3],[10,5],[10,4],[11,5],[11,6],[11,7],[12,5],[12,7],[12,6],[12,8],[13,5],[13,7],[13,6],[13,8],[13,9],[14,5],[14,6],[14,8],[14,9],[14,7],[14,10],[15,6],[15,5],[15,8],[15,9],[15,7],[15,10],[15,11],[16,6],[16,8],[16,9],[16,7],[16,10],[16,5],[16,11],[16,9],[17,8],[17,6],[17,9],[17,11],[17,10],[18,9],[18,7],[18,10],[18,11],[18,8],[18,6],[18,12],[18,11]];
    rej.forEach(function(r){
      var jx=(Math.random()-0.5)*8;
      var jy=(Math.random()-0.5)*6;
      svg.appendChild(el('circle',{cx:sx(r[0])+jx,cy:sy(r[1])+jy,r:'3',fill:'#f85149',opacity:'0.5'}));
    });

    /* Final value label */
    svg.appendChild(txt('text',{x:sx(18)+12,y:sy(17)+4,fill:'#e6edf3','font-size':'12','font-weight':'700','font-family':'system-ui,sans-serif'},'17'));

    box.appendChild(svg);
  })();

})();
</script>

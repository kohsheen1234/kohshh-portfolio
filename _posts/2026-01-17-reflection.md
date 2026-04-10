---
layout: post
title: "Chapter 4: Reflection"
description: "First drafts are rarely final. Reflection gives agents the ability to critique their own outputs, find what's wrong, and iterate toward better results — before returning anything to you."
tags: agentic-ai llm reflection
date: 2026-01-17
featured: true
author: Kohsheen Tiku
toc: true
mermaid:
  enabled: true
  zoomable: true
---

## The Problem with First Drafts

<div class="concept-box">
  <span class="concept-label">Before You Start — Key Terms Explained</span>
  <p><strong>System prompt:</strong> A set of instructions sent to the LLM <em>before</em> the user's message. It defines the AI's persona, rules, and behavior. e.g., "You are a senior code reviewer. Be critical and look for bugs." The same model behaves very differently with different system prompts.</p>
  <p style="margin-top:0.5rem"><strong>Feedback loop:</strong> A cycle where the output of one step becomes input to the same (or earlier) step. Reflection is a feedback loop: generate → evaluate → the evaluation feeds back into the generation.</p>
  <p style="margin-top:0.5rem"><strong>Deterministic vs probabilistic:</strong> Deterministic means the same input always gives the same output (like a calculator). Probabilistic means the same input might give different outputs (like an LLM). Temperature 0 makes LLMs more deterministic but never fully so.</p>
  <p style="margin-top:0.5rem"><strong>Iteration:</strong> One complete cycle of "try → evaluate → try again." Three iterations means the agent attempted to improve the output three times.</p>
</div>

In [Chapter 1](/kohshh-portfolio/blog/2026/prompt-chaining/) through [Chapter 3](/kohshh-portfolio/blog/2026/parallelization/), every pattern shares one assumption: once a step produces output, that output moves forward. The chain trusts it. The router acts on it. The synthesizer combines it.

But what if the output is wrong?

LLMs make mistakes. They miss edge cases, hallucinate facts, generate code with bugs, write summaries that lose key details. A single-pass pipeline has no way to catch any of this. It just passes the mistake downstream — and by the time it reaches the user, the error is baked in.

The fix is to add a feedback loop: **make the agent evaluate its own output before declaring it done**.

That's **reflection** — one of the most powerful patterns in agentic AI.

**The mechanism behind why it works.** When you give the LLM a different system prompt for the critique step — "You are a senior software engineer performing a meticulous code review" — you're not just changing words. You're changing the entire *context* in which the model generates its next tokens. The model has learned, from millions of examples of code reviews, what senior engineers look for: off-by-one errors, missing edge cases, documentation gaps, security vulnerabilities, inefficient algorithms. That behavioral pattern is encoded in the model's weights. The system prompt activates it.

This is why the same model — using the exact same underlying neural network — can produce dramatically better results as a two-call system than as a single call: the critic's system prompt activates a different behavioral mode, one specifically trained to find problems, rather than the creator's mode that's trained to generate solutions. The bias switches from "make something plausible" to "find what's wrong with this."

**Why self-review is cognitively difficult.** When you generate something, you've already committed to a mental model of how it works. Reviewing it immediately afterward, you tend to read what you *intended* to write rather than what you *actually* wrote. Your brain auto-corrects the errors before you consciously notice them. This is why writers are told to wait a day before editing — fresh eyes catch what tired eyes miss. The same phenomenon applies to LLMs: a separate "critic" call with a fresh context has no prior commitment to the generated output and approaches it with genuine scrutiny.

**The feedback loop that matters.** What separates reflection from a simple two-step chain is the *iterative loop*. After the critic identifies problems and the producer corrects them, the *critic runs again* on the corrected output. This continues until the critic is satisfied or a maximum iteration limit is reached. Each iteration should produce a measurably better output — you can see this clearly in the quality chart below.


## What Reflection Is

Reflection is the pattern where an agent:
1. **Executes** — produces an initial output
2. **Evaluates** — critiques that output against specific criteria
3. **Refines** — generates an improved version based on the critique
4. **Repeats** — until the output meets a quality bar or a max iteration count is hit

<div class="ns-diagram">
  <div class="ns-diagram-header">
    <span class="ns-diagram-label">REFLECTION FEEDBACK LOOP</span>
    <button class="ns-expand-btn" onclick="openNsDiagram(this)"><svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 5V1h4M11 7v4H7M1 5l4-4M11 7l-4 4"/></svg> Expand</button>
  </div>
  <div class="ns-diagram-body">
    <div class="ns-node ns-node-cyan">
      <div class="ns-node-title">Task</div>
      <div class="ns-node-sub">Initial prompt or goal</div>
    </div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-purple">
      <div class="ns-node-title">Execute — Producer Agent</div>
      <div class="ns-node-sub">Generates initial output · code, text, plan</div>
    </div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-amber">
      <div class="ns-node-title">Evaluate — Critic Agent</div>
      <div class="ns-node-sub">Reviews against criteria · finds bugs, gaps, inaccuracies</div>
    </div>
    <div class="ns-arrow"></div>
    <div class="ns-decision">
      <div class="ns-node-title">Satisfactory?</div>
    </div>
    <div class="ns-arrow"></div>
    <div class="ns-branch-row">
      <div class="ns-branch">
        <span class="ns-label-red">Needs work</span>
        <div class="ns-arrow ns-arrow-red"></div>
        <div class="ns-node ns-node-red">
          <div class="ns-node-title">Refine</div>
          <div class="ns-node-sub">Producer rewrites using critique</div>
        </div>
        <div class="ns-arrow ns-arrow-red"></div>
        <div class="ns-node ns-node-dim">
          <div class="ns-node-title">↑ Back to Evaluate</div>
        </div>
      </div>
      <div class="ns-branch">
        <span class="ns-label-green">Approved</span>
        <div class="ns-arrow ns-arrow-green"></div>
        <div class="ns-node ns-node-green">
          <div class="ns-node-title">Final Output</div>
          <div class="ns-node-sub">Quality bar met · done</div>
        </div>
      </div>
    </div>
  </div>
</div>

The key difference from a simple chain: **the arrow goes backward**. Output becomes input again. This is a feedback loop, not a pipeline.

> **The core insight:** A model reviewing its own work with a different system prompt — "you are a senior code reviewer" vs "you are a code generator" — behaves fundamentally differently. The second prompt surfaces errors the first one wouldn't.


## The Feedback Loop, Step by Step

<div class="refl-loop-wrapper">
  <div class="refl-loop-header">
    <span class="refl-loop-title">REFLECTION FEEDBACK LOOP</span>
    <button class="refl-loop-btn" id="reflLoopBtn">▶ Animate</button>
  </div>
  <div class="refl-loop-body">
    <div class="refl-stage-row">
      <div class="refl-stage" id="reflStage0">
        <div class="refl-stage-num">01</div>
        <div class="refl-stage-label">EXECUTE</div>
        <div class="refl-stage-desc">Producer generates initial output (code, text, plan…)</div>
      </div>
      <div class="refl-arrow" id="reflArrow01">→</div>
      <div class="refl-stage" id="reflStage1">
        <div class="refl-stage-num">02</div>
        <div class="refl-stage-label">EVALUATE</div>
        <div class="refl-stage-desc">Critic checks output against criteria — finds bugs, gaps, inaccuracies</div>
      </div>
      <div class="refl-arrow" id="reflArrow12">→</div>
      <div class="refl-stage" id="reflStage2">
        <div class="refl-stage-num">03</div>
        <div class="refl-stage-label">REFINE</div>
        <div class="refl-stage-desc">Producer rewrites using the critique as a guide</div>
      </div>
    </div>
    <div class="refl-feedback-arc">
      <div class="refl-feedback-line" id="reflFeedback">
        <span class="refl-feedback-label">feedback loop → back to EXECUTE</span>
      </div>
    </div>
    <div class="refl-iter-row" id="reflIterRow">
      <div class="refl-iter-dot" id="reflDot0"></div>
      <div class="refl-iter-dot" id="reflDot1"></div>
      <div class="refl-iter-dot" id="reflDot2"></div>
      <div class="refl-iter-dot" id="reflDot3"></div>
      <span class="refl-iter-label" id="reflIterLabel">Iteration: 0 / 3</span>
    </div>
  </div>
</div>

<style>
.refl-loop-wrapper {
  border: 1px solid var(--global-divider-color);
  border-radius: 10px;
  overflow: hidden;
  margin: 2rem 0;
}
.refl-loop-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.1rem;
  border-bottom: 1px solid var(--global-divider-color);
  background: rgba(128,128,128,0.05);
}
.refl-loop-title {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--global-text-color);
}
.refl-loop-btn {
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
.refl-loop-btn:hover { background: rgba(38,152,186,0.15); border-color:#2698ba; color:#2698ba; }
.refl-loop-body { padding: 1.5rem 1.1rem 1rem; }
.refl-stage-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}
.refl-stage {
  border: 1.5px solid var(--global-divider-color);
  border-radius: 8px;
  padding: 1rem;
  width: 160px;
  text-align: center;
  transition: border-color 0.3s, background 0.3s;
  background: rgba(128,128,128,0.03);
  flex-shrink: 0;
}
.refl-stage.active {
  border-color: #2698ba;
  background: rgba(38,152,186,0.08);
}
.refl-stage.active .refl-stage-num { color: #2698ba; }
.refl-stage-num {
  font-family: monospace;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--global-text-color-light);
  margin-bottom: 0.35rem;
  transition: color 0.3s;
}
.refl-stage-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--global-text-color);
  margin-bottom: 0.4rem;
}
.refl-stage-desc {
  font-size: 0.68rem;
  color: var(--global-text-color-light);
  line-height: 1.5;
}
.refl-arrow {
  font-size: 1.2rem;
  color: var(--global-text-color-light);
  transition: color 0.3s;
  flex-shrink: 0;
}
.refl-arrow.active { color: #2698ba; }
.refl-feedback-arc {
  margin-top: 0.75rem;
  display: flex;
  justify-content: center;
}
.refl-feedback-line {
  border: 1px dashed var(--global-divider-color);
  border-top: none;
  width: 80%;
  height: 24px;
  border-radius: 0 0 8px 8px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 2px;
  transition: border-color 0.3s;
}
.refl-feedback-line.active { border-color: #c97af2; }
.refl-feedback-label {
  font-size: 0.62rem;
  font-family: monospace;
  color: var(--global-text-color-light);
  transition: color 0.3s;
}
.refl-feedback-line.active .refl-feedback-label { color: #c97af2; }
.refl-iter-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 1rem;
}
.refl-iter-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(128,128,128,0.2);
  transition: background 0.3s;
}
.refl-iter-dot.done { background: #4fc97e; }
.refl-iter-dot.active { background: #2698ba; }
.refl-iter-label {
  font-size: 0.68rem;
  font-family: monospace;
  color: var(--global-text-color-light);
  margin-left: 0.5rem;
}
</style>

<script>
(function(){
  var btn = document.getElementById('reflLoopBtn');
  if (!btn) return;

  var stages   = [0,1,2].map(function(i){ return document.getElementById('reflStage'+i); });
  var arrows   = ['01','12'].map(function(s){ return document.getElementById('reflArrow'+s); });
  var feedback = document.getElementById('reflFeedback');
  var dots     = [0,1,2,3].map(function(i){ return document.getElementById('reflDot'+i); });
  var label    = document.getElementById('reflIterLabel');

  var MAX_ITER = 3;
  var running = false;

  function reset() {
    stages.forEach(function(s){ if(s) s.classList.remove('active'); });
    arrows.forEach(function(a){ if(a) a.classList.remove('active'); });
    if(feedback) feedback.classList.remove('active');
    dots.forEach(function(d){ if(d) { d.classList.remove('active','done'); }});
    if(label) label.textContent = 'Iteration: 0 / ' + MAX_ITER;
  }

  function delay(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }

  async function runLoop() {
    reset();
    running = true;
    btn.textContent = '⏳ Running…';
    btn.disabled = true;

    for (var iter = 0; iter < MAX_ITER; iter++) {
      // Mark completed dots
      for (var d = 0; d < iter; d++) { dots[d].classList.remove('active'); dots[d].classList.add('done'); }
      dots[iter].classList.add('active');
      if(label) label.textContent = 'Iteration: ' + (iter+1) + ' / ' + MAX_ITER;

      // EXECUTE
      stages[0].classList.add('active');
      await delay(700);

      // → arrow
      arrows[0].classList.add('active');
      await delay(300);

      // EVALUATE
      stages[0].classList.remove('active');
      stages[1].classList.add('active');
      await delay(800);

      // → arrow
      arrows[1].classList.add('active');
      await delay(300);

      // REFINE
      stages[1].classList.remove('active');
      stages[2].classList.add('active');
      await delay(700);

      if (iter < MAX_ITER - 1) {
        // feedback loop arc
        stages[2].classList.remove('active');
        arrows[0].classList.remove('active');
        arrows[1].classList.remove('active');
        feedback.classList.add('active');
        await delay(600);
        feedback.classList.remove('active');
      }
    }

    // Final state
    dots[MAX_ITER-1].classList.remove('active');
    dots[MAX_ITER-1].classList.add('done');
    stages[2].classList.remove('active');
    if(label) label.textContent = '✓ Done — output approved';
    running = false;
    btn.textContent = '↺ Replay';
    btn.disabled = false;
  }

  btn.addEventListener('click', function(){
    if (!running) runLoop();
  });
})();
</script>


## Self-Reflection vs Producer-Critic

There are two ways to implement reflection. The choice changes both the quality of the output and the architecture of the system. Understanding when to choose each approach is as important as understanding how to implement them.

### Approach 1: Self-Reflection

A single agent generates output, then switches roles to critique it.

<div class="ns-diagram">
  <div class="ns-diagram-header">
    <span class="ns-diagram-label">SELF-REFLECTION — one agent, two system prompts, one loop</span>
    <button class="ns-expand-btn" onclick="openNsDiagram(this)"><svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 5V1h4M11 7v4H7M1 5l4-4M11 7l-4 4"/></svg> Expand</button>
  </div>
  <div class="ns-diagram-body" style="flex-direction:row;align-items:center;gap:0.75rem;padding:1.1rem 1.25rem;flex-wrap:nowrap;">
    <div class="ns-node ns-node-cyan" style="flex-shrink:0;max-width:120px;"><div class="ns-node-title">Task</div></div>
    <div style="color:#4a5a6a;font-size:1.2rem;">→</div>
    <div class="ns-node ns-node-purple" style="flex-shrink:0;max-width:200px;">
      <div class="ns-node-title">Same Agent — Generator</div>
      <div class="ns-node-sub">system prompt: "write code"</div>
    </div>
    <div style="color:#4a5a6a;font-size:1.2rem;">→</div>
    <div class="ns-node ns-node-amber" style="flex-shrink:0;max-width:200px;">
      <div class="ns-node-title">Same Agent — Critic</div>
      <div class="ns-node-sub">system prompt: "review code"</div>
    </div>
    <div style="color:#4a5a6a;font-size:1.2rem;">→</div>
    <div style="display:flex;flex-direction:column;gap:0.4rem;flex-shrink:0;">
      <div class="ns-node ns-node-red"><div class="ns-node-title">Needs work → loops back</div></div>
      <div class="ns-node ns-node-green"><div class="ns-node-title">Approved → Output</div></div>
    </div>
  </div>
</div>

**Simpler to implement.** One model, two system prompts. But the same model that generated the output is also evaluating it — it tends to be less critical of its own work.

### Approach 2: Producer-Critic

Two distinct agents with separate roles and personas.

<div class="ns-diagram">
  <div class="ns-diagram-header">
    <span class="ns-diagram-label">PRODUCER-CRITIC — two separate agents, objective review</span>
    <button class="ns-expand-btn" onclick="openNsDiagram(this)"><svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 5V1h4M11 7v4H7M1 5l4-4M11 7l-4 4"/></svg> Expand</button>
  </div>
  <div class="ns-diagram-body" style="padding:1.1rem 1.25rem;">
    <div class="ns-node ns-node-cyan" style="max-width:200px;"><div class="ns-node-title">Task</div><div class="ns-node-sub">what needs to be created</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-purple" style="max-width:260px;"><div class="ns-node-title">Producer Agent</div><div class="ns-node-sub">generates: code, text, or plan — first draft</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node" style="max-width:220px;"><div class="ns-node-title">Draft Output</div><div class="ns-node-sub">passed to the critic for review</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-amber" style="max-width:260px;"><div class="ns-node-title">Critic Agent</div><div class="ns-node-sub">different system prompt · fresh perspective · finds issues</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-decision" style="max-width:180px;"><div class="ns-node-title">Approved?</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-branch-row" style="max-width:440px;">
      <div class="ns-branch">
        <span class="ns-label-red">No — iterate</span>
        <div class="ns-arrow ns-arrow-red"></div>
        <div class="ns-node ns-node-red"><div class="ns-node-title">Back to Producer</div><div class="ns-node-sub">critique used to improve next draft</div></div>
      </div>
      <div class="ns-branch">
        <span class="ns-label-green">Yes</span>
        <div class="ns-arrow ns-arrow-green"></div>
        <div class="ns-node ns-node-green"><div class="ns-node-title">Final Output</div><div class="ns-node-sub">quality bar met</div></div>
      </div>
    </div>
  </div>
</div>

**More powerful.** The Critic has a completely different system prompt — "You are a senior software engineer", "You are a meticulous fact-checker" — and approaches the output with a fresh lens. It doesn't have the generator's blind spots.

| | Self-Reflection | Producer-Critic |
|---|---|---|
| **Agents** | 1 (two roles) | 2 (dedicated) |
| **Objectivity** | Lower — same model bias | Higher — separate perspective |
| **Cost** | Lower | Higher |
| **Critique quality** | General | Specialized |
| **Best for** | Quick refinement | High-stakes, quality-critical tasks |


## Quality Improves with Each Iteration

<div class="refl-quality-wrapper">
  <div class="refl-quality-header">
    <span class="refl-quality-title">OUTPUT QUALITY vs REFLECTION ITERATIONS</span>
    <button class="refl-quality-btn" id="qualityPlayBtn">▶ Animate</button>
  </div>
  <canvas id="qualityChart" style="display:block;width:100%;"></canvas>
  <div class="refl-quality-footer" id="qualityFooter" style="display:none">
    Reflection cycles stopped at iteration 3 — quality crossed the acceptable threshold
  </div>
</div>

<style>
.refl-quality-wrapper {
  border: 1px solid var(--global-divider-color);
  border-radius: 10px;
  overflow: hidden;
  margin: 2rem 0;
}
.refl-quality-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.1rem;
  border-bottom: 1px solid var(--global-divider-color);
  background: rgba(128,128,128,0.05);
}
.refl-quality-title {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--global-text-color);
}
.refl-quality-btn {
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
.refl-quality-btn:hover { background: rgba(38,152,186,0.15); border-color:#2698ba; color:#2698ba; }
.refl-quality-footer {
  padding: 0.6rem 1.1rem;
  border-top: 1px solid var(--global-divider-color);
  background: rgba(79,201,126,0.06);
  font-size: 0.75rem;
  color: #4fc97e;
  font-family: monospace;
}
</style>

<script>
(function(){
  var canvas  = document.getElementById('qualityChart');
  var playBtn = document.getElementById('qualityPlayBtn');
  var footer  = document.getElementById('qualityFooter');
  if (!canvas || !playBtn) return;

  var dataPoints = [
    { label: 'v0 — Initial',  score: 44, note: 'Bug in loop range, no docstring, no edge case handling' },
    { label: 'v1 — Iter 1',   score: 67, note: 'Bug fixed, docstring added — still no ValueError for negatives' },
    { label: 'v2 — Iter 2',   score: 83, note: 'Error handling added — type hints missing, could be cleaner' },
    { label: 'v3 — Iter 3',   score: 91, note: 'Type hints added, code clean — critic approves' },
    { label: 'v4 — Iter 4',   score: 95, note: 'Minor style polish — diminishing returns' },
  ];
  var THRESHOLD = 80;
  var PAD = { top: 28, right: 24, bottom: 52, left: 52 };
  var H = 240;

  function getTheme() {
    var s = getComputedStyle(document.documentElement);
    return {
      text:  s.getPropertyValue('--global-text-color').trim()       || '#e0e0e0',
      muted: s.getPropertyValue('--global-text-color-light').trim() || '#888',
      div:   s.getPropertyValue('--global-divider-color').trim()    || '#333',
    };
  }

  var tooltip = null;
  function ensureTooltip() {
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.style.cssText = 'position:fixed;background:var(--global-bg-color,#111);border:1px solid var(--global-divider-color,#333);border-radius:6px;padding:0.45rem 0.7rem;font-size:0.72rem;color:var(--global-text-color,#e0e0e0);pointer-events:none;z-index:200;max-width:240px;line-height:1.5;display:none;box-shadow:0 4px 16px rgba(0,0,0,0.4);';
      document.body.appendChild(tooltip);
    }
    return tooltip;
  }

  var hitPoints = [];

  function draw(progress) {
    var dpr = window.devicePixelRatio || 1;
    var W = canvas.parentElement ? canvas.parentElement.getBoundingClientRect().width : 560;
    if (W < 10) W = 560;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.height = H + 'px';
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    var th = getTheme();

    var PW = W - PAD.left - PAD.right;
    var PH = H - PAD.top - PAD.bottom;

    hitPoints = [];

    // Y grid + axis
    ctx.font = '10px monospace';
    [0,20,40,60,80,100].forEach(function(v){
      var y = PAD.top + (1 - v/100) * PH;
      ctx.strokeStyle = th.div; ctx.lineWidth = 0.5;
      ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left+PW, y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = th.muted; ctx.textAlign = 'right';
      ctx.fillText(v, PAD.left - 6, y + 3.5);
    });

    // Y label
    ctx.save(); ctx.translate(12, PAD.top + PH/2); ctx.rotate(-Math.PI/2);
    ctx.textAlign = 'center'; ctx.fillStyle = th.muted; ctx.font = '10px monospace';
    ctx.fillText('Quality Score', 0, 0); ctx.restore();

    // Threshold line
    var ty = PAD.top + (1 - THRESHOLD/100) * PH;
    ctx.strokeStyle = 'rgba(79,201,126,0.4)'; ctx.lineWidth = 1;
    ctx.setLineDash([5,4]);
    ctx.beginPath(); ctx.moveTo(PAD.left, ty); ctx.lineTo(PAD.left+PW, ty); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#4fc97e'; ctx.font = '9px monospace'; ctx.textAlign = 'left';
    ctx.fillText('acceptable (' + THRESHOLD + ')', PAD.left + 4, ty - 4);

    // Data points to draw (based on progress)
    var n = dataPoints.length;
    var step = PW / (n - 1);
    var totalSegments = n - 1;
    var drawn = progress * totalSegments;

    // Line
    ctx.beginPath();
    ctx.strokeStyle = '#2698ba'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
    for (var i = 0; i < n; i++) {
      var seg = drawn - (i - 1);
      if (i === 0) {
        var x0 = PAD.left;
        var y0 = PAD.top + (1 - dataPoints[0].score/100) * PH;
        ctx.moveTo(x0, y0);
      } else {
        var frac = Math.min(Math.max(drawn - (i-1), 0), 1);
        var xPrev = PAD.left + (i-1)*step;
        var yPrev = PAD.top + (1 - dataPoints[i-1].score/100)*PH;
        var xCurr = PAD.left + i*step;
        var yCurr = PAD.top + (1 - dataPoints[i].score/100)*PH;
        ctx.lineTo(xPrev + (xCurr-xPrev)*frac, yPrev + (yCurr-yPrev)*frac);
      }
    }
    ctx.stroke();

    // Gradient fill under line
    var grad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top+PH);
    grad.addColorStop(0, 'rgba(38,152,186,0.25)');
    grad.addColorStop(1, 'rgba(38,152,186,0)');
    ctx.beginPath();
    ctx.moveTo(PAD.left, PAD.top + PH);
    for (var j = 0; j < n; j++) {
      var segJ = Math.min(Math.max(drawn - (j > 0 ? j-1 : 0), 0), 1);
      if (j === 0) {
        ctx.lineTo(PAD.left, PAD.top + (1 - dataPoints[0].score/100)*PH);
      } else {
        var frac2 = Math.min(Math.max(drawn-(j-1), 0), 1);
        var xP = PAD.left + (j-1)*step;
        var yP = PAD.top + (1-dataPoints[j-1].score/100)*PH;
        var xC = PAD.left + j*step;
        var yC = PAD.top + (1-dataPoints[j].score/100)*PH;
        ctx.lineTo(xP + (xC-xP)*frac2, yP + (yC-yP)*frac2);
      }
    }
    var lastDrawnX = PAD.left + Math.min(drawn, n-1) * step;
    ctx.lineTo(lastDrawnX, PAD.top + PH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Dots + X labels
    dataPoints.forEach(function(pt, i) {
      if (drawn < i) return;
      var frac = i === 0 ? 1 : Math.min(drawn - (i-1), 1);
      if (frac <= 0) return;
      var px = PAD.left + i * step;
      var py = PAD.top + (1 - pt.score/100)*PH;

      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI*2);
      ctx.fillStyle = pt.score >= THRESHOLD ? '#4fc97e' : '#2698ba';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1;
      ctx.stroke();

      // Score label
      ctx.fillStyle = pt.score >= THRESHOLD ? '#4fc97e' : '#2698ba';
      ctx.font = '700 10px monospace'; ctx.textAlign = 'center';
      ctx.fillText(pt.score, px, py - 9);

      // X label
      ctx.fillStyle = th.muted; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText(pt.label, px, H - PAD.bottom + 16);

      hitPoints.push({ x: px, y: py, pt: pt });
    });
  }

  draw(0);

  // Hover tooltip
  canvas.addEventListener('mousemove', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = e.clientX - rect.left;
    var my = e.clientY - rect.top;
    var tt = ensureTooltip();
    var hit = null;
    hitPoints.forEach(function(h) {
      var dx = mx - h.x, dy = my - h.y;
      if (Math.sqrt(dx*dx+dy*dy) < 14) hit = h;
    });
    if (hit) {
      tt.innerHTML = '<strong>' + hit.pt.label + '</strong><br>Score: ' + hit.pt.score + '/100<br><span style="color:var(--global-text-color-light,#888);font-size:0.68rem">' + hit.pt.note + '</span>';
      tt.style.display = 'block';
      tt.style.left = (e.clientX + 12) + 'px';
      tt.style.top  = (e.clientY - 10) + 'px';
      canvas.style.cursor = 'pointer';
    } else {
      tt.style.display = 'none';
      canvas.style.cursor = 'default';
    }
  });
  canvas.addEventListener('mouseleave', function() {
    ensureTooltip().style.display = 'none';
  });

  var animId = null, running = false;
  playBtn.addEventListener('click', function(){
    if (running) return;
    footer.style.display = 'none';
    running = true;
    playBtn.textContent = '⏳ Running…';
    playBtn.disabled = true;
    var DURATION = 2400, startTs = null;
    function frame(ts) {
      if (!startTs) startTs = ts;
      var p = Math.min((ts - startTs) / DURATION, 1);
      draw(p * (dataPoints.length - 1));
      if (p < 1) { animId = requestAnimationFrame(frame); }
      else {
        running = false;
        playBtn.textContent = '↺ Replay';
        playBtn.disabled = false;
        footer.style.display = 'block';
      }
    }
    requestAnimationFrame(frame);
  });

  window.addEventListener('resize', function(){ draw(0); footer.style.display='none'; });
})();
</script>

Hover over any data point to see what the critique found at that iteration. Notice the **diminishing returns** past iteration 3 — this is why reflection loops always need a stopping condition.


## The Live Demo: A Bug Found and Fixed

This is a concrete reflection cycle. The initial code has a real bug. Click through to watch the critic find it and the producer fix it.

<div class="refl-demo-wrapper">
  <div class="refl-demo-header">
    <span class="refl-demo-title">PRODUCER-CRITIC LIVE DEMO — Factorial Function</span>
  </div>
  <div class="refl-demo-tabs">
    <button class="refl-tab active" data-tab="v1" onclick="reflTab('v1')">Draft v1</button>
    <button class="refl-tab" data-tab="critique" onclick="reflTab('critique')">Critique</button>
    <button class="refl-tab" data-tab="v2" onclick="reflTab('v2')">Refined v2</button>
  </div>

  <div class="refl-tab-content active" id="reflTab-v1">
    <div class="refl-code-label">PRODUCER OUTPUT — initial draft</div>
    <pre class="refl-code"><code><span class="refl-bug">def calculate_factorial(n):
    result = 1
    for i in range(1, n):  # ← bug: misses n itself
        result *= i
    return result</span></code></pre>
    <div class="refl-code-note">5 lines. No docstring. No edge cases. Hidden off-by-one bug in <code>range(1, n)</code> — <code>calculate_factorial(5)</code> returns 24 instead of 120.</div>
    <button class="refl-next-btn" onclick="reflTab('critique')">Send to Critic →</button>
  </div>

  <div class="refl-tab-content" id="reflTab-critique">
    <div class="refl-code-label">CRITIC OUTPUT — structured review</div>
    <div class="refl-critique-list">
      <div class="refl-critique-item refl-crit-error">
        <span class="refl-crit-icon">✗</span>
        <div><strong>Off-by-one error</strong> — <code>range(1, n)</code> excludes <code>n</code>. For n=5: produces 1×2×3×4=24, not 120. Must be <code>range(1, n+1)</code>.</div>
      </div>
      <div class="refl-critique-item refl-crit-error">
        <span class="refl-crit-icon">✗</span>
        <div><strong>Missing edge case</strong> — <code>calculate_factorial(0)</code> returns 1 only by coincidence (empty loop). This is mathematically correct but undocumented.</div>
      </div>
      <div class="refl-critique-item refl-crit-warn">
        <span class="refl-crit-icon">!</span>
        <div><strong>No input validation</strong> — negative input (e.g., n=-3) runs silently and returns 1. Should raise <code>ValueError</code>.</div>
      </div>
      <div class="refl-critique-item refl-crit-warn">
        <span class="refl-crit-icon">!</span>
        <div><strong>No docstring</strong> — function contract, args, return value, and exceptions are undocumented.</div>
      </div>
      <div class="refl-critique-item refl-crit-info">
        <span class="refl-crit-icon">→</span>
        <div><strong>No type hints</strong> — consider <code>def calculate_factorial(n: int) -&gt; int</code> for clarity.</div>
      </div>
    </div>
    <div class="refl-critique-verdict refl-verdict-fail">✗ NEEDS REVISION — 2 critical errors, 2 warnings found</div>
    <button class="refl-next-btn" onclick="reflTab('v2')">Apply critique → Refine</button>
  </div>

  <div class="refl-tab-content" id="reflTab-v2">
    <div class="refl-code-label">PRODUCER OUTPUT — refined v2</div>
    <pre class="refl-code"><code>def calculate_factorial(n: int) -> int:
    <span class="refl-added">"""Calculate the factorial of a non-negative integer n.

    Args:
        n: A non-negative integer.
    Returns:
        The factorial of n (n!). Returns 1 when n is 0.
    Raises:
        ValueError: If n is negative.
    """
    if n < 0:
        raise ValueError(f"Input must be non-negative, got {n}.")
    if n == 0:
        return 1</span>
    result = 1
    for i in range(1, <span class="refl-added">n + 1</span>):  <span class="refl-added"># ← fixed</span>
        result *= i
    return result</code></pre>
    <div class="refl-critique-verdict refl-verdict-pass">✓ APPROVED — all issues addressed</div>
    <div class="refl-code-note">All 5 critique points addressed. Bug fixed. Docstring complete. Edge cases handled. Type hints added.</div>
  </div>
</div>

<style>
.refl-demo-wrapper {
  border: 1px solid var(--global-divider-color);
  border-radius: 10px;
  overflow: hidden;
  margin: 2rem 0;
}
.refl-demo-header {
  padding: 0.75rem 1.1rem;
  border-bottom: 1px solid var(--global-divider-color);
  background: rgba(128,128,128,0.05);
}
.refl-demo-title {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--global-text-color);
}
.refl-demo-tabs {
  display: flex;
  border-bottom: 1px solid var(--global-divider-color);
}
.refl-tab {
  flex: 1;
  padding: 0.55rem 0.75rem;
  font-family: monospace;
  font-size: 0.72rem;
  border: none;
  border-right: 1px solid var(--global-divider-color);
  background: transparent;
  color: var(--global-text-color-light);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.refl-tab:last-child { border-right: none; }
.refl-tab.active { background: rgba(38,152,186,0.1); color: #2698ba; font-weight: 700; }
.refl-tab:hover:not(.active) { background: rgba(128,128,128,0.08); color: var(--global-text-color); }
.refl-tab-content { display: none; padding: 1.1rem; }
.refl-tab-content.active { display: block; }
.refl-code-label {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--global-text-color-light);
  margin-bottom: 0.6rem;
}
.refl-code {
  background: rgba(0,0,0,0.25);
  border: 1px solid var(--global-divider-color);
  border-radius: 6px;
  padding: 0.9rem 1rem;
  font-size: 0.82rem;
  overflow-x: auto;
  margin-bottom: 0.75rem;
}
.refl-code code { background: none; padding: 0; font-family: monospace; }
.refl-bug { color: #ff6b6b; }
.refl-added { color: #4fc97e; }
.refl-code-note {
  font-size: 0.75rem;
  color: var(--global-text-color-light);
  line-height: 1.55;
  margin-bottom: 0.75rem;
}
.refl-critique-list { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.75rem; }
.refl-critique-item {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.6rem 0.75rem;
  border-radius: 5px;
  font-size: 0.8rem;
  line-height: 1.5;
}
.refl-crit-error { background: rgba(255,107,107,0.08); border: 1px solid rgba(255,107,107,0.2); }
.refl-crit-warn  { background: rgba(230,168,23,0.08);  border: 1px solid rgba(230,168,23,0.2); }
.refl-crit-info  { background: rgba(38,152,186,0.06);  border: 1px solid rgba(38,152,186,0.15); }
.refl-crit-icon { font-size: 0.75rem; flex-shrink: 0; padding-top: 0.1rem; font-weight: 700; }
.refl-crit-error .refl-crit-icon { color: #ff6b6b; }
.refl-crit-warn  .refl-crit-icon { color: #e6a817; }
.refl-crit-info  .refl-crit-icon { color: #2698ba; }
.refl-critique-verdict {
  font-size: 0.75rem;
  font-family: monospace;
  font-weight: 700;
  padding: 0.45rem 0.75rem;
  border-radius: 4px;
  margin-bottom: 0.75rem;
}
.refl-verdict-fail { background: rgba(255,107,107,0.1); color: #ff6b6b; border: 1px solid rgba(255,107,107,0.2); }
.refl-verdict-pass { background: rgba(79,201,126,0.1);  color: #4fc97e; border: 1px solid rgba(79,201,126,0.2); }
.refl-next-btn {
  font-family: monospace;
  font-size: 0.72rem;
  padding: 0.35rem 0.9rem;
  border-radius: 4px;
  border: 1px solid var(--global-divider-color);
  background: transparent;
  color: var(--global-text-color);
  cursor: pointer;
  transition: background 0.15s;
}
.refl-next-btn:hover { background: rgba(38,152,186,0.12); border-color:#2698ba; color:#2698ba; }
</style>

<script>
function reflTab(name) {
  document.querySelectorAll('.refl-tab').forEach(function(t){ t.classList.remove('active'); });
  document.querySelectorAll('.refl-tab-content').forEach(function(t){ t.classList.remove('active'); });
  var btn = document.querySelector('[data-tab="'+name+'"]');
  var content = document.getElementById('reflTab-'+name);
  if (btn) btn.classList.add('active');
  if (content) content.classList.add('active');
}
</script>


## Six Situations Where Reflection Pays Off

<div class="refl-usecases-grid">
  <div class="refl-usecase-card">
    <span class="refl-uc-num">01</span>
    <h4>Code Generation</h4>
    <p>Write code, run static analysis or tests, feed results back — the agent fixes its own bugs before you see the output.</p>
    <span class="refl-uc-gain">Catches runtime errors, logic bugs, style issues</span>
  </div>
  <div class="refl-usecase-card">
    <span class="refl-uc-num">02</span>
    <h4>Long-Form Content</h4>
    <p>Generate a draft, critique for tone, flow, and clarity, rewrite. Repeat until the piece reads like something an editor approved.</p>
    <span class="refl-uc-gain">Polished prose without human editing rounds</span>
  </div>
  <div class="refl-usecase-card">
    <span class="refl-uc-num">03</span>
    <h4>Summarization</h4>
    <p>Generate a summary, compare against the source document for missed key points, refine until complete and accurate.</p>
    <span class="refl-uc-gain">Reduces hallucinations and key-point omissions</span>
  </div>
  <div class="refl-usecase-card">
    <span class="refl-uc-num">04</span>
    <h4>Planning</h4>
    <p>Propose a plan, evaluate feasibility and constraint violations, revise. Don't hand over a plan that fails on day one.</p>
    <span class="refl-uc-gain">More realistic, executable plans</span>
  </div>
  <div class="refl-usecase-card">
    <span class="refl-uc-num">05</span>
    <h4>Fact-Checking</h4>
    <p>A Critic agent with a "fact-checker" persona reviews every claim in the draft and flags anything that needs sourcing or correction.</p>
    <span class="refl-uc-gain">Structural defense against hallucination</span>
  </div>
  <div class="refl-usecase-card">
    <span class="refl-uc-num">06</span>
    <h4>Complex Reasoning</h4>
    <p>Propose a reasoning step, evaluate whether it leads closer to the solution or introduces contradictions, backtrack if needed.</p>
    <span class="refl-uc-gain">Enables multi-step problem solving</span>
  </div>
</div>

<style>
.refl-usecases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 0.85rem;
  margin: 1.5rem 0;
}
.refl-usecase-card {
  border: 1px solid var(--global-divider-color);
  border-radius: 8px;
  padding: 1rem;
  background: rgba(128,128,128,0.04);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.refl-uc-num { font-family: monospace; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.1em; color: #c97af2; }
.refl-usecase-card h4 { font-size: 0.85rem; font-weight: 700; margin: 0; color: var(--global-text-color); }
.refl-usecase-card p  { font-size: 0.78rem; color: var(--global-text-color-light); margin: 0; line-height: 1.5; }
.refl-uc-gain { font-size: 0.7rem; font-family: monospace; color: #4fc97e; margin-top: auto; padding-top: 0.35rem; border-top: 1px solid var(--global-divider-color); }
</style>


## The LangChain Way: LCEL Reflection Loop

The LangChain implementation uses **conversation history** as the state that carries context between generation and critique cycles. Each iteration appends messages to a growing list, so the model always has full context on what it produced and what the critique said.

```python
import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
```

> **Why `messages` instead of `ChatPromptTemplate`?**
> This example uses raw message lists rather than prompt templates. That's because the conversation history needs to grow dynamically — each iteration appends a new critique and a new refinement. Template-based prompts have fixed slots; message lists are append-only, which is exactly what a growing feedback loop needs.

```python
llm = ChatOpenAI(model="gpt-4o", temperature=0.1)
```

> `temperature=0.1` — very low. For code generation and code review, you want deterministic, consistent outputs. Creativity hurts here; precision helps.

### The Task Definition

```python
task_prompt = """
Your task is to create a Python function named `calculate_factorial`.
Requirements:
1. Accept a single integer `n` as input.
2. Calculate its factorial (n!).
3. Include a clear docstring.
4. Handle edge cases: factorial of 0 is 1.
5. Raise ValueError for negative input.
"""
```

> This is the source of truth that both the Generator and the Critic reference. The Critic compares every output against this spec — so the spec must be complete and unambiguous from the start.

### The Reflection Loop

```python
max_iterations = 3
current_code   = ""
message_history = [HumanMessage(content=task_prompt)]   # starts with just the task

for i in range(max_iterations):

    # ── STAGE 1: GENERATE (or REFINE) ──────────────────────────────────
    if i == 0:
        # First pass: just the task prompt
        response = llm.invoke(message_history)
    else:
        # Subsequent passes: task + previous code + critique
        message_history.append(
            HumanMessage(content="Refine the code using the critiques provided.")
        )
        response = llm.invoke(message_history)

    current_code = response.content
    message_history.append(response)        # add generated code to history
```

> **Why append to history?** The model receives the entire conversation on each call. By appending both the generated code and the critique, the model knows:
> 1. The original task (what was asked)
> 2. What it previously generated (so it doesn't repeat it)
> 3. What the critic said (so it knows what to fix)
>
> Without this, each iteration would generate from scratch with no awareness of previous attempts.

```python
    # ── STAGE 2: REFLECT (CRITIQUE) ────────────────────────────────────
    reflector_messages = [
        SystemMessage(content="""
You are a senior software engineer. Perform a meticulous code review.
Evaluate the code against the original task requirements.
Check for: bugs, missing edge cases, style issues, incomplete docstrings.
If the code is perfect, respond with exactly: CODE_IS_PERFECT
Otherwise, provide a bulleted list of specific critiques.
"""),
        HumanMessage(content=f"Task:\n{task_prompt}\n\nCode:\n{current_code}")
    ]
    critique_response = llm.invoke(reflector_messages)
    critique = critique_response.content
```

> **Why a separate system prompt for the Critic?** This is the Producer-Critic split within a single LangChain call. By giving the same model a completely different system prompt ("senior software engineer performing a code review"), you get a different reasoning stance. The model is no longer generating — it's scrutinizing.
>
> **Why not add the Critic's system prompt to the main conversation history?** Because you want the Critic to always evaluate from a fresh perspective, not a perspective shaped by the previous generation attempts. Each critique call is independent.

```python
    # ── STOPPING CONDITION ───────────────────────────────────────────────
    if "CODE_IS_PERFECT" in critique:
        break                                   # stop early — quality bar met

    # Add critique to history so next iteration can fix it
    message_history.append(
        HumanMessage(content=f"Critique:\n{critique}")
    )
```

> **Early stopping matters.** Without a stopping condition, the loop runs all `max_iterations` even when the output is already good — wasting API calls. The `CODE_IS_PERFECT` sentinel lets the Critic signal satisfaction explicitly.

### Message History at Iteration 2

```
message_history after 2 iterations:
┌──────────────────────────────────────────────────────────┐
│ [0] Human: "Write a function that calculates factorial…" │  ← task
│ [1] AI:    "def calculate_factorial(n):\n    result=1…"  │  ← v1 code
│ [2] Human: "Critique:\n• Bug in range(1,n)…\n• No doc…" │  ← critique 1
│ [3] Human: "Refine the code using the critiques."        │  ← trigger
│ [4] AI:    "def calculate_factorial(n: int) -> int:\n…"  │  ← v2 code
└──────────────────────────────────────────────────────────┘
```

The model at iteration 2 sees the full thread and knows exactly what changed and why.

### Full Reflection Data Flow

<div class="ns-diagram">
  <div class="ns-diagram-header">
    <span class="ns-diagram-label">LANGCHAIN REFLECTION DATA FLOW — how code and critique pass between roles</span>
    <button class="ns-expand-btn" onclick="openNsDiagram(this)"><svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 5V1h4M11 7v4H7M1 5l4-4M11 7l-4 4"/></svg> Expand</button>
  </div>
  <div class="ns-diagram-body" style="padding:1.1rem 1.25rem;">
    <div class="ns-node ns-node-cyan" style="max-width:280px;"><div class="ns-node-title">task_prompt + message_history</div><div class="ns-node-sub">growing conversation thread — task, code, critique, refinement</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-purple" style="max-width:260px;"><div class="ns-node-title">LLM — Generator Role</div><div class="ns-node-sub">writes or improves the code</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node" style="max-width:220px;"><div class="ns-node-title">current_code</div><div class="ns-node-sub">added back to message_history for context</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-amber" style="max-width:260px;"><div class="ns-node-title">LLM — Critic Role</div><div class="ns-node-sub">different system prompt · reviews code · produces critique</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-decision" style="max-width:220px;"><div class="ns-node-title">CODE_IS_PERFECT?</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-branch-row" style="max-width:440px;">
      <div class="ns-branch">
        <span class="ns-label-red">No — has issues</span>
        <div class="ns-arrow ns-arrow-red"></div>
        <div class="ns-node ns-node-red"><div class="ns-node-title">Add critique to history</div><div class="ns-node-sub">generator reads it on next iteration</div></div>
      </div>
      <div class="ns-branch">
        <span class="ns-label-green">Yes — approved</span>
        <div class="ns-arrow ns-arrow-green"></div>
        <div class="ns-node ns-node-green"><div class="ns-node-title">Final Output</div><div class="ns-node-sub">loop exits</div></div>
      </div>
    </div>
  </div>
</div>


## The Google ADK Way: Generator-Critic

The ADK version uses **session state** (key-value store) instead of message history for passing data between agents. The architecture is simpler to read but less flexible for complex multi-turn loops.

```python
from google.adk.agents import SequentialAgent, LlmAgent
```

> **Why only `SequentialAgent` and `LlmAgent`?** The ADK has a `LoopAgent` for true iterative loops, but the core reflection concept is demonstrated here in a single generate → critique cycle using `SequentialAgent`. Two agents, run in order, sharing state via `output_key`.

### The Producer Agent

```python
generator = LlmAgent(
    name        = "DraftWriter",
    description = "Generates initial draft content on a given subject.",
    instruction = "Write a short, informative paragraph about the user's subject.",
    output_key  = "draft_text",    # stores output in session state
)
```

> **`output_key`**: When `DraftWriter` completes, its output is stored as `session_state["draft_text"]`. Any subsequent agent can read this by referencing `{draft_text}` in its instruction template.
>
> **Why not just pass the output directly?** ADK agents are independent workers. They don't pass return values to each other — they communicate through shared session state. This decouples the producer from the consumer; you can add more critics, rearrange them, or branch without modifying the producer.

### The Critic Agent

```python
reviewer = LlmAgent(
    name        = "FactChecker",
    description = "Reviews text for factual accuracy and provides structured critique.",
    instruction = """
You are a meticulous fact-checker.
1. Read the text provided in the state key 'draft_text'.
2. Carefully verify the factual accuracy of all claims.
3. Your final output must be a dictionary with two keys:
   - "status":    "ACCURATE" or "INACCURATE"
   - "reasoning": A clear explanation citing specific issues if any.
""",
    output_key  = "review_output",  # stores critique in session state
)
```

> **Why `{draft_text}` in the instruction?** The ADK automatically fills `{key}` placeholders from session state before calling the model. So the Critic's actual prompt at runtime contains the full text that `DraftWriter` produced — without any manual wiring.
>
> **Why structured output (dict with `status` + `reasoning`)?** Structured output is machine-readable. A downstream agent or your own application code can parse `session_state["review_output"]["status"]` to decide whether to trigger another iteration — without parsing free-form text.

### The Pipeline

```python
review_pipeline = SequentialAgent(
    name       = "WriteAndReviewPipeline",
    sub_agents = [generator, reviewer],
)
```

> `SequentialAgent` guarantees `generator` completes before `reviewer` starts. This matters because `reviewer` reads from `session_state["draft_text"]` — which must already exist.

### Execution State at Each Step

```
Session State Evolution:
┌─────────────────────────────────────────────────────┐
│ Before:  {}                                         │
│                                                     │
│ After DraftWriter:                                  │
│   { "draft_text": "Solar panels convert sunlight…" }│
│                                                     │
│ After FactChecker:                                  │
│   { "draft_text": "Solar panels convert sunlight…", │
│     "review_output": {                              │
│       "status":    "INACCURATE",                    │
│       "reasoning": "Claim about 40% efficiency      │
│                     is incorrect — max ~26%…"       │
│     }                                               │
│   }                                                 │
└─────────────────────────────────────────────────────┘
```

### ADK Orchestration

<div class="ns-diagram">
  <div class="ns-diagram-header">
    <span class="ns-diagram-label">ADK REFLECTION — SequentialAgent passing state between writer and checker</span>
    <button class="ns-expand-btn" onclick="openNsDiagram(this)"><svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 5V1h4M11 7v4H7M1 5l4-4M11 7l-4 4"/></svg> Expand</button>
  </div>
  <div class="ns-diagram-body" style="padding:1.1rem 1.25rem;">
    <div class="ns-node ns-node-cyan" style="max-width:200px;"><div class="ns-node-title">User Input</div><div class="ns-node-sub">e.g. "Write a paragraph about Mars"</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node" style="max-width:240px;"><div class="ns-node-title">SequentialAgent</div><div class="ns-node-sub">runs DraftWriter first, then FactChecker</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-purple" style="max-width:260px;"><div class="ns-node-title">DraftWriter LlmAgent</div><div class="ns-node-sub">writes paragraph · output_key: "draft_text" → saved to Session State</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-amber" style="max-width:260px;"><div class="ns-node-title">Session State</div><div class="ns-node-sub">shared memory between agents · FactChecker reads draft_text from here</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-cyan" style="max-width:260px;"><div class="ns-node-title">FactChecker LlmAgent</div><div class="ns-node-sub">reads draft_text · outputs: status "ACCURATE" or "INACCURATE" + reasoning</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-green" style="max-width:240px;"><div class="ns-node-title">Critique Result</div><div class="ns-node-sub">status + reasoning saved to review_output key</div></div>
  </div>
</div>


## Side by Side: LangChain vs ADK

| | LangChain (LCEL) | Google ADK |
|---|---|---|
| **State mechanism** | Growing `message_history` list | Key-value session state (`output_key`) |
| **Iteration control** | Explicit `for` loop + early-break | `LoopAgent` (or manual SequentialAgent chains) |
| **Critique format** | Free-form string in conversation | Structured dict (better for programmatic use) |
| **Role switching** | New `SystemMessage` per call | Separate `LlmAgent` with dedicated instruction |
| **Context window risk** | Higher — history grows each iteration | Lower — only relevant state keys passed |
| **Stopping condition** | Sentinel string (`CODE_IS_PERFECT`) | Status field in structured output |
| **Best for** | Iterative loops where history matters | Single-cycle generate → critique → act |


## The Trade-offs You Can't Ignore

Reflection is not free. Every iteration adds:

<div class="refl-tradeoffs-grid">
  <div class="refl-tradeoff-card refl-tradeoff-cost">
    <div class="refl-tradeoff-icon">💸</div>
    <h4>Cost</h4>
    <p>Each iteration is at least 2 LLM calls (generator + critic). A 3-iteration loop = 6 API calls. At GPT-4o pricing, this adds up fast for high-volume tasks.</p>
  </div>
  <div class="refl-tradeoff-card refl-tradeoff-latency">
    <div class="refl-tradeoff-icon">⏱</div>
    <h4>Latency</h4>
    <p>Iterations are sequential — each must complete before the next begins. A 3-iteration loop with 3s per call = 9s minimum. Unsuitable for real-time use cases.</p>
  </div>
  <div class="refl-tradeoff-card refl-tradeoff-context">
    <div class="refl-tradeoff-icon">📋</div>
    <h4>Context Growth</h4>
    <p>Each iteration appends to the conversation history. After 4-5 cycles on a long document, you may approach the model's context window limit.</p>
  </div>
  <div class="refl-tradeoff-card refl-tradeoff-loop">
    <div class="refl-tradeoff-icon">∞</div>
    <h4>Infinite Loops</h4>
    <p>Without a firm <code>max_iterations</code> cap and a clear stopping condition, the agent can loop indefinitely — especially if the Critic keeps finding minor issues.</p>
  </div>
</div>

<style>
.refl-tradeoffs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(185px, 1fr));
  gap: 0.85rem;
  margin: 1.5rem 0;
}
.refl-tradeoff-card {
  border: 1px solid var(--global-divider-color);
  border-radius: 8px;
  padding: 1rem;
  background: rgba(128,128,128,0.04);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.refl-tradeoff-cost    { border-left: 3px solid #ff6b6b; }
.refl-tradeoff-latency { border-left: 3px solid #e6a817; }
.refl-tradeoff-context { border-left: 3px solid #c97af2; }
.refl-tradeoff-loop    { border-left: 3px solid #2698ba; }
.refl-tradeoff-icon { font-size: 1.2rem; }
.refl-tradeoff-card h4 { font-size: 0.85rem; font-weight: 700; margin: 0; color: var(--global-text-color); }
.refl-tradeoff-card p  { font-size: 0.78rem; color: var(--global-text-color-light); margin: 0; line-height: 1.5; }
</style>

> **Rule of thumb:** Use reflection when quality and accuracy matter more than speed and cost. Don't use it as the default — use it selectively for the parts of your pipeline where errors are expensive.


## At a Glance

<div class="refl-summary-card">
  <div class="refl-summary-col">
    <div class="refl-summary-label">WHAT</div>
    <p>A feedback loop where an agent evaluates its own output — or a dedicated Critic agent evaluates it — and uses the critique to generate an improved version.</p>
  </div>
  <div class="refl-summary-divider"></div>
  <div class="refl-summary-col">
    <div class="refl-summary-label">WHY</div>
    <p>First-pass outputs from LLMs are often incomplete, inaccurate, or non-compliant. Reflection adds a self-correction layer — catching errors before they reach the user.</p>
  </div>
  <div class="refl-summary-divider"></div>
  <div class="refl-summary-col">
    <div class="refl-summary-label">RULE OF THUMB</div>
    <p>Use when output quality matters more than speed. Use a separate Critic agent (not self-reflection) when the task requires specialized evaluation — code review, fact-checking, compliance.</p>
  </div>
</div>

<style>
.refl-summary-card {
  display: flex;
  border: 1px solid var(--global-divider-color);
  border-radius: 10px;
  overflow: hidden;
  margin: 1.5rem 0;
}
@media (max-width: 640px) { .refl-summary-card { flex-direction: column; } }
.refl-summary-col { flex: 1; padding: 1.1rem; background: rgba(128,128,128,0.03); }
.refl-summary-col p { font-size: 0.8rem; color: var(--global-text-color-light); line-height: 1.6; margin: 0.4rem 0 0; }
.refl-summary-divider { width: 1px; background: var(--global-divider-color); flex-shrink: 0; }
.refl-summary-label { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.12em; color: #c97af2; }
</style>




## Common Mistakes When Implementing Reflection

**Mistake 1: No maximum iteration limit.**
Without a `max_iterations` cap, a reflection loop can run indefinitely if the critic always finds something to improve. Always set a firm limit. Three iterations is usually enough for most tasks; five is the practical maximum before diminishing returns dominate.

**Mistake 2: Vague critique criteria.**
A critic system prompt that says "review the code for quality" will produce inconsistent, general feedback. Be specific: "Check for off-by-one errors, missing input validation, undocumented edge cases, and incorrect handling of empty inputs." Specific criteria produce actionable, concrete critiques that the producer can actually act on.

**Mistake 3: Producer doesn't read the critique.**
The producer's refinement prompt must explicitly include the critique and instruct the model to address every point. Simply passing "here's the critique, now rewrite" sometimes leads the model to make superficial changes while ignoring specific issues. Add: "Address each point in the critique above specifically, and explain what you changed."

**Mistake 4: Not tracking which iteration produced which output.**
When debugging, you need to know whether the quality improved with each iteration. Log the output and the critique at every step. This also helps you identify when to stop — sometimes the output peaks at iteration 2 and gets worse at iteration 3 (over-optimization is real).

**Mistake 5: Using reflection for everything.**
Reflection adds significant latency (multiple LLM calls) and cost. Don't use it for simple, low-stakes outputs. Use it when: (1) the output quality directly affects user experience, (2) the task involves verifiable correctness (code, factual content), or (3) the cost of a wrong answer is high.

## Key Takeaways

- **Reflection = feedback loop.** The output doesn't move forward until it passes evaluation. Generate → critique → refine → repeat.
- **Producer-Critic beats self-reflection** for quality-critical tasks. A separate system prompt creates a genuinely different perspective; the same model reviewing its own work has blind spots.
- **The stopping condition is mandatory.** Always pair a `max_iterations` cap with an explicit quality signal (sentinel string, structured status field). Without both, loops run forever.
- **LangChain uses growing message history** — the full conversation thread (task, code, critique, refinement) is passed on each call. Natural for iterative loops; risks context window overflow at scale.
- **ADK uses session state** — agents write to named keys, other agents read from them. Cleaner data handoff; structured output is easier to act on programmatically.
- **Cost scales with iterations.** Each reflection cycle is 2+ LLM calls. Budget for it or gate reflection behind a quality pre-check.
- **Connections forward:** Reflection pairs naturally with memory (Chapter 8) — a Critic that remembers what it critiqued before can give progressively sharper feedback. It also anchors to goal-setting (Chapter 11) — the goal is the benchmark the Critic evaluates against.


*Next up — Chapter 5: Tool Use, where agents stop reasoning in text and start taking real actions in the world.*

---
layout: post
title: "Chapter 1: Prompt Chaining"
description: "LLMs choke on complex tasks. Prompt chaining fixes that — by breaking one hard problem into a sequence of simple ones, each feeding the next."
tags: agentic-ai llm prompt-engineering
date: 2026-01-05
featured: true
author: Kohsheen Tiku
toc: true
mermaid:
  enabled: true
  zoomable: true
---

## The Problem with One Big Prompt

<div class="concept-box">
  <span class="concept-label">Before You Start — Key Terms Explained</span>
  <p><strong>LLM (Large Language Model):</strong> A type of AI trained on enormous amounts of text (books, websites, code) that can generate human-like text in response to prompts. GPT-4, Gemini, Claude — these are all LLMs.</p>
  <p style="margin-top:0.5rem"><strong>Prompt:</strong> The text you send to an LLM. Think of it as your question or instruction. The quality of the prompt directly affects the quality of the response.</p>
  <p style="margin-top:0.5rem"><strong>Context window:</strong> The LLM's "working memory" — the maximum amount of text it can see at once. If you send a very long conversation, the model may "forget" things from early on because they fell outside the window.</p>
  <p style="margin-top:0.5rem"><strong>Hallucination:</strong> When an LLM confidently states something false. It doesn't know that it's wrong — it's just predicting plausible-sounding text based on patterns it learned. This is a core reliability problem that prompt chaining helps solve.</p>
  <p style="margin-top:0.5rem"><strong>Temperature:</strong> A setting (0 to 1) that controls how "creative" vs "predictable" the output is. Temperature 0 = always picks the most likely next word (deterministic). Temperature 1 = more random and creative. For factual tasks, use 0. For brainstorming, use higher values.</p>
  <p style="margin-top:0.5rem"><strong>API (Application Programming Interface):</strong> A way for programs to talk to each other. When you use LangChain to call GPT-4, it's sending your prompt to OpenAI's API over the internet and getting a response back.</p>
</div>

<style>
/* Beginner-friendly concept callout boxes */
.concept-box {
  border-left: 3px solid #4fc97e;
  background: rgba(79,201,126,0.06);
  border-radius: 0 8px 8px 0;
  padding: 0.85rem 1.1rem;
  margin: 1.25rem 0;
}
.concept-box .concept-label {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #4fc97e;
  display: block;
  margin-bottom: 0.4rem;
  font-family: monospace;
}
.concept-box p { margin: 0; font-size: 0.88rem; line-height: 1.65; color: var(--global-text-color); }
.concept-box code { font-size: 0.82em; }

.analogy-box {
  border-left: 3px solid #e6a817;
  background: rgba(230,168,23,0.05);
  border-radius: 0 8px 8px 0;
  padding: 0.85rem 1.1rem;
  margin: 1.25rem 0;
}
.analogy-box .analogy-label {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #e6a817;
  display: block;
  margin-bottom: 0.4rem;
  font-family: monospace;
}
.analogy-box p { margin: 0; font-size: 0.88rem; line-height: 1.65; color: var(--global-text-color); font-style: italic; }

.warning-box {
  border-left: 3px solid #ff6b6b;
  background: rgba(255,107,107,0.05);
  border-radius: 0 8px 8px 0;
  padding: 0.85rem 1.1rem;
  margin: 1.25rem 0;
}
.warning-box .warning-label {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #ff6b6b;
  display: block;
  margin-bottom: 0.4rem;
  font-family: monospace;
}
.warning-box p { margin: 0; font-size: 0.88rem; line-height: 1.65; color: var(--global-text-color); }
</style>

Imagine asking a single intern to — in one go — read a 50-page report, extract key data, spot trends, write a summary, *and* draft an email to the CEO. All at once. No notes allowed.

They'd probably do a few things okay and quietly drop the rest.

That's exactly what happens when you give a large language model (LLM) one massive, complicated instruction. The model gets overwhelmed. It forgets parts of the prompt. It loses track of what it was doing. It makes stuff up to fill in the gaps.

This has a name: **cognitive overload**. And it's the #1 reason LLM outputs go wrong on complex tasks.

Here's what failure looks like in practice:

| What goes wrong | What it means |
|---|---|
| **Instruction neglect** | The model quietly ignores parts of your prompt |
| **Contextual drift** | It forgets the original goal halfway through |
| **Error propagation** | One early mistake snowballs into a broken answer |
| **Hallucination** | When unsure, it confidently makes things up |


## The Fix: Chain Your Prompts

**Prompt chaining** solves this by doing what any good manager does — breaking the big task into smaller steps, where each step has exactly one job.

Step 1 does its job. Passes its output to Step 2. Step 2 does its job. Passes to Step 3. And so on.

Think of it like an assembly line. Each station handles one thing and does it well. The car doesn't get assembled all at once by one person.

<div class="chain-demo-wrapper">
  <div class="chain-demo-header">
    <span class="chain-demo-label">INTERACTIVE DEMO — watch prompt chaining in action</span>
    <button class="chain-demo-btn" id="chainRunBtn">▶ Run Chain</button>
  </div>
  <div class="chain-demo-body">
    <div class="chain-node chain-node--input" id="chainNode0">
      <div class="chain-node-tag">RAW INPUT</div>
      <div class="chain-node-content"><em>"Market report: AI adoption in enterprise grew 340% in 2024. Healthcare led at 67%, finance at 52%. Top blockers: data privacy (43%) and integration costs (38%)."</em></div>
    </div>
    <div class="chain-connector" id="chainConn1">
      <div class="chain-connector-pipe"></div>
      <div class="chain-connector-label">PROMPT 1 — Summarise the report</div>
    </div>
    <div class="chain-node" id="chainNode1">
      <div class="chain-node-tag">STEP 1 — SUMMARISE</div>
      <div class="chain-node-content" id="chainOut1"><span class="chain-placeholder">Waiting…</span></div>
    </div>
    <div class="chain-connector" id="chainConn2">
      <div class="chain-connector-pipe"></div>
      <div class="chain-connector-label">PROMPT 2 — Extract top trends as JSON</div>
    </div>
    <div class="chain-node" id="chainNode2">
      <div class="chain-node-tag">STEP 2 — EXTRACT TRENDS</div>
      <div class="chain-node-content" id="chainOut2"><span class="chain-placeholder">Waiting…</span></div>
    </div>
    <div class="chain-connector" id="chainConn3">
      <div class="chain-connector-pipe"></div>
      <div class="chain-connector-label">PROMPT 3 — Draft email from trends</div>
    </div>
    <div class="chain-node" id="chainNode3">
      <div class="chain-node-tag">STEP 3 — DRAFT EMAIL</div>
      <div class="chain-node-content" id="chainOut3"><span class="chain-placeholder">Waiting…</span></div>
    </div>
  </div>
  <div class="chain-demo-status" id="chainStatus">Click <strong>Run Chain</strong> to see each step process and pass its output forward.</div>
</div>

<style>
.chain-demo-wrapper {
  border: 1px solid var(--global-divider-color);
  border-radius: 10px;
  overflow: hidden;
  margin: 2rem 0;
  font-family: inherit;
}
.chain-demo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--global-divider-color);
  background: rgba(128,128,128,0.06);
}
.chain-demo-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--global-text-color-light);
}
.chain-demo-btn {
  background: var(--global-theme-color);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.35rem 0.9rem;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.04em;
  transition: opacity 0.2s;
}
.chain-demo-btn:hover { opacity: 0.85; }
.chain-demo-btn:disabled { opacity: 0.4; cursor: default; }
.chain-demo-body {
  padding: 1.5rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.chain-node {
  border: 1px solid var(--global-divider-color);
  border-radius: 8px;
  padding: 0.9rem 1.1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}
.chain-node--input {
  background: rgba(128,128,128,0.04);
}
.chain-node.chain-node--active {
  border-color: var(--global-theme-color);
  box-shadow: 0 0 0 1px var(--global-theme-color);
}
.chain-node.chain-node--done {
  border-color: rgba(38,152,186,0.4);
}
.chain-node-tag {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--global-text-color-light);
  margin-bottom: 0.5rem;
}
.chain-node-content {
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--global-text-color);
  min-height: 1.5rem;
}
.chain-placeholder {
  color: var(--global-text-color-light);
  opacity: 0.4;
  font-style: italic;
}
.chain-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.4rem 0;
}
.chain-connector-pipe {
  width: 2px;
  height: 16px;
  background: var(--global-divider-color);
  border-radius: 1px;
}
.chain-connector-label {
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--global-text-color-light);
  opacity: 0.6;
}
.chain-demo-status {
  padding: 0.65rem 1.25rem;
  border-top: 1px solid var(--global-divider-color);
  font-size: 0.78rem;
  color: var(--global-text-color-light);
  background: rgba(128,128,128,0.04);
  min-height: 2.2rem;
}
.chain-cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: var(--global-theme-color);
  margin-left: 1px;
  animation: blink 0.7s step-end infinite;
  vertical-align: text-bottom;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
pre.chain-json {
  background: rgba(128,128,128,0.1);
  border-radius: 6px;
  padding: 0.75rem 1rem;
  font-size: 0.78rem;
  overflow-x: auto;
  margin: 0;
  white-space: pre;
}
</style>

<script>
(function() {
  var steps = [
    {
      id: 'chainOut1',
      status: 'AI adoption in enterprise surged 340% in 2024. Healthcare (67%) and finance (52%) led the way. Key blockers remain: data privacy concerns (43%) and high integration costs (38%).',
      delay: 800
    },
    {
      id: 'chainOut2',
      status: null,
      isJson: true,
      json: '{\n  "trends": [\n    {\n      "trend": "Healthcare AI adoption",\n      "data": "67% of enterprise AI deployments"\n    },\n    {\n      "trend": "Finance AI adoption",\n      "data": "52% of enterprise AI deployments"\n    },\n    {\n      "trend": "Data privacy as blocker",\n      "data": "43% cite as top concern"\n    }\n  ]\n}',
      delay: 600
    },
    {
      id: 'chainOut3',
      status: 'Subject: AI Market Trends — Action Required\n\nHi team,\n\nQ2 data shows enterprise AI adoption up 340% YoY. Healthcare and finance are leading. Our two biggest growth blockers remain data privacy and integration cost — both addressable. I\'d like to discuss a targeted response by end of week.\n\n— Kohsheen',
      delay: 600
    }
  ];

  var nodeIds = ['chainNode1','chainNode2','chainNode3'];
  var connIds = ['chainConn1','chainConn2','chainConn3'];
  var running = false;

  function typeText(el, text, speed, cb) {
    el.innerHTML = '<span class="chain-cursor"></span>';
    var i = 0;
    var cursor = el.querySelector('.chain-cursor');
    function tick() {
      if (i < text.length) {
        el.insertBefore(document.createTextNode(text[i]), cursor);
        i++;
        setTimeout(tick, speed);
      } else {
        if (cursor) cursor.remove();
        if (cb) cb();
      }
    }
    setTimeout(tick, 100);
  }

  function setStatus(msg) {
    var s = document.getElementById('chainStatus');
    if (s) s.innerHTML = msg;
  }

  function activateConnector(id) {
    var c = document.getElementById(id);
    if (c) {
      var pipe = c.querySelector('.chain-connector-pipe');
      if (pipe) pipe.style.background = 'var(--global-theme-color)';
      var lbl = c.querySelector('.chain-connector-label');
      if (lbl) { lbl.style.opacity = '1'; lbl.style.color = 'var(--global-theme-color)'; }
    }
  }

  function runStep(idx, cb) {
    var step = steps[idx];
    var node = document.getElementById(nodeIds[idx]);
    var out = document.getElementById(step.id);
    if (!node || !out) { if (cb) cb(); return; }

    node.classList.add('chain-node--active');
    setStatus('Processing step ' + (idx + 1) + ' of 3…');

    setTimeout(function() {
      if (step.isJson) {
        var pre = document.createElement('pre');
        pre.className = 'chain-json';
        out.innerHTML = '';
        out.appendChild(pre);
        typeText(pre, step.json, 12, function() {
          node.classList.remove('chain-node--active');
          node.classList.add('chain-node--done');
          if (cb) cb();
        });
      } else {
        typeText(out, step.status, 18, function() {
          node.classList.remove('chain-node--active');
          node.classList.add('chain-node--done');
          if (cb) cb();
        });
      }
    }, step.delay);
  }

  function reset() {
    steps.forEach(function(s, i) {
      var out = document.getElementById(s.id);
      if (out) out.innerHTML = '<span class="chain-placeholder">Waiting…</span>';
      var node = document.getElementById(nodeIds[i]);
      if (node) { node.classList.remove('chain-node--active','chain-node--done'); }
      var conn = document.getElementById(connIds[i]);
      if (conn) {
        var pipe = conn.querySelector('.chain-connector-pipe');
        if (pipe) pipe.style.background = '';
        var lbl = conn.querySelector('.chain-connector-label');
        if (lbl) { lbl.style.opacity = ''; lbl.style.color = ''; }
      }
    });
    setStatus('Click <strong>Run Chain</strong> to see each step process and pass its output forward.');
  }

  document.addEventListener('DOMContentLoaded', function() {
    var btn = document.getElementById('chainRunBtn');
    if (!btn) return;

    btn.addEventListener('click', function() {
      if (running) return;
      running = true;
      btn.disabled = true;
      reset();

      setTimeout(function() {
        activateConnector('chainConn1');
        runStep(0, function() {
          activateConnector('chainConn2');
          runStep(1, function() {
            activateConnector('chainConn3');
            runStep(2, function() {
              setStatus('Chain complete. Each step\'s output fed directly into the next prompt.');
              running = false;
              btn.disabled = false;
              btn.textContent = '↺ Run Again';
            });
          });
        });
      }, 300);
    });
  });
})();
</script>

Here's the key insight: **each step only has one job**. The summariser doesn't worry about emails. The trend-extractor doesn't worry about formatting. When every step is focused, every step does well.


## How to Make the Chain Reliable

There's one thing that can break a chain: **messy data between steps**.

If Step 1 outputs a rambling paragraph and Step 2 is trying to parse it as structured data — it fails. The output needs to be clean and predictable.

The fix is **structured output**. You tell the LLM: "output as JSON, nothing else." Like this:

```json
{
  "trends": [
    {
      "trend": "Healthcare AI adoption",
      "data": "67% of enterprise deployments"
    },
    {
      "trend": "Finance AI adoption",
      "data": "52% of enterprise deployments"
    }
  ]
}
```

JSON is machine-readable. It can be passed directly into the next prompt without any ambiguity. This is what makes chains robust at scale.

### Assign a Role at Each Step

One more trick: give the model a **role** at each step. It anchors the model's tone and focus.

- Step 1 prompt starts with: *"You are a Market Analyst. Your sole task is to summarise..."*
- Step 2 prompt starts with: *"You are a Data Analyst. Extract trends from..."*
- Step 3 prompt starts with: *"You are a Business Writer. Draft a clear email..."*

It sounds silly, but it works. The model "picks up" the persona and stays consistent within that step.


## Where Prompt Chaining Applies

This pattern shows up everywhere once you recognise it.

### Information Processing

Raw data → clean → extract entities → search database → generate report. Each arrow is a prompt.

### Complex Questions

*"What caused the 1929 crash and how did government respond?"*

You can't answer that well in one go. You split it:

<div class="ns-diagram">
  <div class="ns-diagram-header">
    <span class="ns-diagram-label">PROMPT CHAINING PATTERN</span>
    <button class="ns-expand-btn" onclick="openNsDiagram(this)"><svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 5V1h4M11 7v4H7M1 5l4-4M11 7l-4 4"/></svg> Expand</button>
  </div>
  <div class="ns-diagram-body">
    <div class="ns-node ns-node-cyan">
      <div class="ns-node-title">Raw Input</div>
      <div class="ns-node-sub">Market report · unstructured text</div>
    </div>
    <div class="ns-arrow"></div>
    <div class="ns-node">
      <div class="ns-node-title">Step 1 — Summarise</div>
      <div class="ns-node-sub">One job: condense the report into key facts</div>
    </div>
    <div class="ns-arrow"></div>
    <div class="ns-node">
      <div class="ns-node-title">Step 2 — Extract Trends</div>
      <div class="ns-node-sub">One job: pull top 3 trends as structured JSON</div>
    </div>
    <div class="ns-arrow"></div>
    <div class="ns-node">
      <div class="ns-node-title">Step 3 — Draft Email</div>
      <div class="ns-node-sub">One job: write the CEO email from the trends</div>
    </div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-green">
      <div class="ns-node-title">Final Output</div>
      <div class="ns-node-sub">Polished email — each step focused, no overload</div>
    </div>
  </div>
</div>

Steps 1 and 2 can even run **in parallel** — two LLM calls at the same time — then synthesise at the end. This is faster and more reliable than one giant prompt.

### Data Extraction (with Retry Logic)

Prompt chaining isn't always linear. You can add **conditional steps**:

1. Try to extract fields from an invoice
2. Check: did we get everything?
3. If not → run another prompt specifically targeting the missing fields
4. Repeat until valid

This is how you build reliable OCR pipelines. The LLM extracts text, normalises it ("one thousand and fifty" → `1050`), then hands arithmetic to an external calculator. Each step does what it's best at.

### Content Generation

Blog posts, reports, documentation — all follow a natural chain:
1. Generate topic ideas
2. Pick one, generate an outline
3. Write each section (using previous section as context)
4. Final review pass

### Conversations with Memory

Each conversation turn becomes a prompt that includes the previous exchange. The chain *is* the memory. This is how conversational AI maintains context across a long back-and-forth.

### Code Generation

1. Understand the request → write pseudocode
2. Generate code from pseudocode
3. Run linter/tests (this is a **tool call**, not an LLM call)
4. If errors → fix them with another prompt
5. Add docs

The critical thing here: **you can insert regular code between LLM calls**. Run a linter. Call an API. Do a database lookup. The chain isn't just LLM calls — it's a proper pipeline.


## The Code

We'll build a two-step LangChain pipeline that:
1. Reads a laptop spec in plain English
2. Extracts the specs from it
3. Formats them as a clean JSON object

Think of each step as one worker doing one job, then passing a note to the next worker.

### Install

```bash
pip install langchain langchain-openai python-dotenv
```

`langchain` is the framework. `langchain-openai` is the plugin for OpenAI models. `python-dotenv` loads your API key from a `.env` file so you don't hardcode secrets.

### Set Up Your API Key

```python
# .env file (never commit this)
OPENAI_API_KEY=sk-...
```

```python
from dotenv import load_dotenv
load_dotenv()  # reads .env and puts OPENAI_API_KEY into the environment
```

### Initialise the Model

```python
from langchain_openai import ChatOpenAI

# temperature=0 means deterministic — the model picks the most likely token
# every time, no randomness. Good for extraction tasks.
# temperature=1 = more creative/varied. Bad for structured data extraction.
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
```

`ChatOpenAI` is a wrapper around OpenAI's chat API. Every call to `llm` sends a request to the API and returns a response object. We haven't called it yet — we're just configuring it.

### Define the Prompts

```python
from langchain_core.prompts import ChatPromptTemplate

# Prompt 1: extract specs from the raw text
# {text_input} is a placeholder — gets replaced with actual text at runtime
prompt_extract = ChatPromptTemplate.from_template("""
You are a hardware spec extractor. Your only job is to pull out technical
specifications from the text below. Be precise. Output only what's in the text.

Text: {text_input}
""")

# Prompt 2: take the extracted specs and structure them as JSON
# {specifications} gets filled with the OUTPUT of prompt 1
prompt_transform = ChatPromptTemplate.from_template("""
You are a data formatter. Take the hardware specifications below and output
a JSON object with exactly three keys: "cpu", "memory", "storage".
No extra text, no explanation — JSON only.

Specifications: {specifications}
""")
```

`ChatPromptTemplate.from_template()` builds a reusable prompt with named placeholders. When you call the chain, you pass in the values that fill those placeholders.

**Why two prompts instead of one?** Try asking the model to extract *and* format at once — it often formats wrong, or forgets to extract something. Splitting the jobs gives each step full attention.

### Wire the Chain with LCEL

This is the key step. LangChain's **LCEL** (LangChain Expression Language) uses the `|` pipe operator — same as Unix pipes — to connect components.

```python
from langchain_core.output_parsers import StrOutputParser

# StrOutputParser converts the model's response object → plain string
# Without it, you'd get an AIMessage object, not a string

# --- Chain 1: extract specs ---
# Flow: prompt_extract fills {text_input}
#       → sends to llm → gets AI response
#       → StrOutputParser strips it to plain text
extraction_chain = prompt_extract | llm | StrOutputParser()

# --- Chain 2: full pipeline ---
# {"specifications": extraction_chain} runs extraction_chain first,
# then puts the result into {specifications} of prompt_transform
full_chain = (
    {"specifications": extraction_chain}  # ← runs chain 1, stores result
    | prompt_transform                     # ← fills {specifications}
    | llm                                  # ← sends to model
    | StrOutputParser()                    # ← strips to plain string
)
```

Read it left to right. Each `|` says "take the output of the left side and pass it as input to the right side." The chain is lazy — nothing runs until you call `.invoke()`.

### Run It

```python
result = full_chain.invoke({
    "text_input": "New laptop: 3.5 GHz octa-core CPU, 16GB RAM, 1TB NVMe SSD."
})

print(result)
```

`.invoke()` triggers the whole pipeline. Under the hood, this is what happens:

```
1. prompt_extract receives: text_input = "New laptop: 3.5 GHz..."
2. llm receives the filled prompt → returns: "CPU: 3.5 GHz octa-core..."
3. StrOutputParser strips it to a plain string
4. prompt_transform receives: specifications = "CPU: 3.5 GHz octa-core..."
5. llm receives the filled prompt → returns: {"cpu": "3.5 GHz octa-core"...}
6. StrOutputParser strips it → final output
```

**Output:**

```json
{
  "cpu": "3.5 GHz octa-core",
  "memory": "16GB",
  "storage": "1TB NVMe SSD"
}
```

### What You Get at Each Step

To see intermediate outputs (helpful for debugging), run each chain separately:

```python
# See what extraction_chain produces before it hits the formatter
raw_extraction = extraction_chain.invoke({
    "text_input": "New laptop: 3.5 GHz octa-core CPU, 16GB RAM, 1TB NVMe SSD."
})
print("After step 1:", raw_extraction)
# → "CPU: 3.5 GHz octa-core\nRAM: 16GB\nStorage: 1TB NVMe SSD"

# Now run the full thing
final = full_chain.invoke({"text_input": "..."})
print("After step 2:", final)
# → {"cpu": "3.5 GHz octa-core", "memory": "16GB", "storage": "1TB NVMe SSD"}
```

This is one of the best things about LCEL — any sub-chain is itself a runnable. You can test each step independently before connecting them.

### Why This Beats One Big Prompt

Here's simulated data from running both approaches 60 times on 60 different laptop descriptions. The Y-axis is **output quality** (0 = completely broken JSON or wrong fields, 1 = perfect extraction).

<div class="chain-chart-wrapper">
  <div class="chain-chart-header">
    <span class="chain-chart-title">CHAIN vs. SINGLE-PROMPT OUTPUT QUALITY</span>
    <span class="chain-chart-subtitle">60 runs on varied laptop descriptions</span>
  </div>
  <div class="chain-chart-area">
    <canvas id="chainQualityChart" width="680" height="300"></canvas>
  </div>
  <div class="chain-chart-controls">
    <button class="chain-chart-play" id="chartPlayBtn" title="Play">&#9654;</button>
    <div class="chain-chart-scrubber-wrap">
      <input type="range" id="chartScrubber" min="0" max="59" value="0" step="1" class="chain-chart-scrubber">
    </div>
    <span class="chain-chart-counter" id="chartCounter">0 / 60</span>
  </div>
  <div class="chain-chart-legend">
    <span class="chain-chart-legend-item"><span class="legend-dot legend-dot--chain"></span> chained output</span>
    <span class="chain-chart-legend-item"><span class="legend-dot legend-dot--single"></span> single-prompt output</span>
    <span class="chain-chart-legend-item"><span class="legend-dash"></span> quality threshold (0.70)</span>
  </div>
</div>

<style>
.chain-chart-wrapper {
  border: 1px solid var(--global-divider-color);
  border-radius: 10px;
  overflow: hidden;
  margin: 2rem 0;
}
.chain-chart-header {
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid var(--global-divider-color);
  background: rgba(128,128,128,0.05);
}
.chain-chart-title {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--global-text-color);
  display: block;
}
.chain-chart-subtitle {
  font-size: 0.65rem;
  color: var(--global-text-color-light);
  opacity: 0.7;
}
.chain-chart-area {
  padding: 0.5rem 0.5rem 0;
  overflow-x: auto;
}
#chainQualityChart {
  display: block;
  max-width: 100%;
  height: auto;
}
.chain-chart-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 1.25rem;
  border-top: 1px solid var(--global-divider-color);
}
.chain-chart-play {
  background: none;
  border: 1px solid var(--global-divider-color);
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--global-text-color);
  font-size: 0.7rem;
  flex-shrink: 0;
  transition: border-color 0.2s;
}
.chain-chart-play:hover { border-color: var(--global-theme-color); color: var(--global-theme-color); }
.chain-chart-scrubber-wrap { flex: 1; }
.chain-chart-scrubber {
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--global-divider-color);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}
.chain-chart-scrubber::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--global-text-color);
  cursor: pointer;
}
.chain-chart-counter {
  font-size: 0.72rem;
  color: var(--global-text-color-light);
  white-space: nowrap;
  min-width: 3.5rem;
  text-align: right;
}
.chain-chart-legend {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 0.6rem 1.25rem;
  border-top: 1px solid var(--global-divider-color);
  background: rgba(128,128,128,0.03);
  flex-wrap: wrap;
}
.chain-chart-legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.72rem;
  color: var(--global-text-color-light);
}
.legend-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}
.legend-dot--chain { background: #2698ba; }
.legend-dot--single { background: #e05252; }
.legend-dash {
  width: 18px;
  height: 2px;
  border-top: 2px dashed rgba(255,200,80,0.7);
  display: inline-block;
  flex-shrink: 0;
}
</style>

<script>
(function() {
  // Fixed data: 60 experiments. chain = consistently above 0.70. single = noisy.
  var chainScores  = [0.72,0.68,0.75,0.80,0.63,0.78,0.74,0.69,0.76,0.73,0.71,0.77,0.82,0.65,0.74,0.76,0.79,0.69,0.75,0.78,0.73,0.71,0.74,0.76,0.81,0.72,0.68,0.75,0.77,0.73,0.74,0.70,0.76,0.78,0.72,0.75,0.73,0.79,0.83,0.74,0.71,0.76,0.73,0.78,0.77,0.72,0.74,0.76,0.81,0.73,0.71,0.75,0.77,0.74,0.72,0.78,0.80,0.73,0.75,0.77];
  var singleScores = [0.48,0.71,0.39,0.62,0.44,0.55,0.68,0.41,0.59,0.52,0.38,0.65,0.47,0.73,0.43,0.58,0.46,0.64,0.37,0.56,0.51,0.44,0.68,0.39,0.55,0.62,0.41,0.49,0.66,0.43,0.57,0.38,0.61,0.48,0.55,0.42,0.63,0.47,0.52,0.38,0.64,0.46,0.55,0.41,0.59,0.48,0.53,0.37,0.65,0.44,0.58,0.46,0.62,0.39,0.55,0.48,0.53,0.41,0.57,0.63];
  var TOTAL = chainScores.length;
  var currentFrame = 0;
  var playing = false;
  var animHandle = null;

  var canvas, ctx, scrubber, playBtn, counter;

  // Layout
  var ML = 52, MR = 20, MT = 28, MB = 44;
  var W, H, PW, PH;

  function setup() {
    canvas   = document.getElementById('chainQualityChart');
    scrubber = document.getElementById('chartScrubber');
    playBtn  = document.getElementById('chartPlayBtn');
    counter  = document.getElementById('chartCounter');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    resize();
    draw(currentFrame);

    scrubber.addEventListener('input', function() {
      currentFrame = parseInt(this.value, 10);
      draw(currentFrame);
      counter.textContent = currentFrame + ' / ' + TOTAL;
    });

    playBtn.addEventListener('click', function() {
      if (playing) { pause(); } else { play(); }
    });
  }

  function resize() {
    var rect = canvas.parentElement.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    W = Math.min(680, rect.width - 16);
    H = 300;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);
    PW = W - ML - MR;
    PH = H - MT - MB;
  }

  function xPos(i) { return ML + (i / (TOTAL - 1)) * PW; }
  function yPos(v) { return MT + (1 - (v - 0.3) / 0.6) * PH; }

  function getTheme() {
    var s = getComputedStyle(document.documentElement);
    return {
      text:    s.getPropertyValue('--global-text-color').trim()       || '#e0e0e0',
      muted:   s.getPropertyValue('--global-text-color-light').trim() || '#888',
      divider: s.getPropertyValue('--global-divider-color').trim()    || '#333',
    };
  }

  function draw(upTo) {
    ctx.clearRect(0, 0, W, H);
    var th = getTheme();

    // Grid lines + Y labels
    var yTicks = [0.30,0.40,0.50,0.60,0.70,0.80,0.90];
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    yTicks.forEach(function(v) {
      var y = yPos(v);
      ctx.strokeStyle = th.divider;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(ML, y); ctx.lineTo(ML + PW, y); ctx.stroke();
      ctx.fillStyle = th.muted;
      ctx.fillText(v.toFixed(2), ML - 6, y + 3.5);
    });

    // X axis labels
    ctx.textAlign = 'center';
    ctx.fillStyle = th.muted;
    [0,10,20,30,40,50,60].forEach(function(v) {
      if (v >= TOTAL) return;
      var x = xPos(v === TOTAL ? TOTAL - 1 : v);
      ctx.fillText(v, x, H - MB + 16);
    });

    // Axis label
    ctx.save();
    ctx.translate(10, MT + PH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.font = '10px monospace';
    ctx.fillStyle = th.muted;
    ctx.fillText('quality score', 0, 0);
    ctx.restore();
    ctx.textAlign = 'center';
    ctx.font = '10px monospace';
    ctx.fillStyle = th.muted;
    ctx.fillText('experiment', ML + PW / 2, H - 6);

    // Threshold line at 0.70
    var ty = yPos(0.70);
    ctx.strokeStyle = 'rgba(255,200,80,0.55)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(ML, ty); ctx.lineTo(ML + PW, ty); ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '9px monospace';
    ctx.fillStyle = 'rgba(255,200,80,0.75)';
    ctx.textAlign = 'left';
    ctx.fillText('0.70 quality threshold', ML + 4, ty - 4);

    // Draw dots up to upTo
    for (var i = 0; i <= upTo && i < TOTAL; i++) {
      var x = xPos(i);
      var cs = chainScores[i];
      var ss = singleScores[i];

      // Single-prompt dot (drawn first, behind)
      ctx.beginPath();
      ctx.arc(x, yPos(ss), 4.5, 0, Math.PI * 2);
      ctx.fillStyle = ss >= 0.70 ? 'rgba(224,82,82,0.5)' : 'rgba(224,82,82,0.85)';
      ctx.fill();

      // Chain dot
      ctx.beginPath();
      ctx.arc(x, yPos(cs), 4.5, 0, Math.PI * 2);
      ctx.fillStyle = cs >= 0.70 ? '#2698ba' : 'rgba(38,152,186,0.55)';
      ctx.fill();

      // Tooltip on the last visible point
      if (i === upTo) {
        // Chain tooltip
        drawTooltip(x, yPos(cs), cs.toFixed(3), '#2698ba');
        // Single tooltip
        drawTooltip(x, yPos(ss), ss.toFixed(3), '#e05252');
      }
    }
  }

  function drawTooltip(x, y, label, color) {
    var TW = 44, TH = 18, TR = 3;
    var tx = x - TW / 2;
    var ty = y - TH - 6;
    // keep in bounds
    if (tx < ML) tx = ML;
    if (tx + TW > ML + PW) tx = ML + PW - TW;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(tx, ty, TW, TH, TR) : ctx.rect(tx, ty, TW, TH);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, tx + TW / 2, ty + 12);
  }

  function play() {
    playing = true;
    playBtn.innerHTML = '&#9646;&#9646;';
    if (currentFrame >= TOTAL - 1) { currentFrame = 0; }
    step();
  }

  function pause() {
    playing = false;
    playBtn.innerHTML = '&#9654;';
    if (animHandle) { clearTimeout(animHandle); animHandle = null; }
  }

  function step() {
    if (!playing) return;
    currentFrame = Math.min(currentFrame + 1, TOTAL - 1);
    scrubber.value = currentFrame;
    counter.textContent = currentFrame + ' / ' + TOTAL;
    draw(currentFrame);
    if (currentFrame < TOTAL - 1) {
      animHandle = setTimeout(step, 120);
    } else {
      pause();
    }
  }

  document.addEventListener('DOMContentLoaded', setup);
})();
</script>

Play through the 60 experiments. Notice:
- **Chain (cyan):** consistently above the 0.70 threshold. Reliable.
- **Single-prompt (red):** scattered. Many fall below acceptable quality.

This gap is **why chaining exists**. It's not magic — it's just focus at each step.


## Context Engineering

Here's something most tutorials skip: **what you put *around* the prompt matters as much as the prompt itself**.

There's a discipline called **Context Engineering** — the art of giving the model a rich, complete picture before it generates a response.

<div class="ns-diagram">
  <div class="ns-diagram-header">
    <span class="ns-diagram-label">CONTEXT ENGINEERING</span>
    <button class="ns-expand-btn" onclick="openNsDiagram(this)"><svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 5V1h4M11 7v4H7M1 5l4-4M11 7l-4 4"/></svg> Expand</button>
  </div>
  <div class="ns-diagram-body" style="padding:1.25rem 1.5rem;flex-direction:row;align-items:stretch;gap:0.85rem;">
    <!-- Left: 4 input sources stacked -->
    <div style="display:flex;flex-direction:column;gap:0.5rem;flex-shrink:0;min-width:190px;justify-content:center;">
      <div class="ns-node ns-node-cyan"><div class="ns-node-title">System Prompt</div><div class="ns-node-sub">who the model is</div></div>
      <div class="ns-node ns-node-purple"><div class="ns-node-title">Retrieved Docs</div><div class="ns-node-sub">facts from your KB</div></div>
      <div class="ns-node ns-node-amber"><div class="ns-node-title">Tool Outputs</div><div class="ns-node-sub">API / calendar results</div></div>
      <div class="ns-node"><div class="ns-node-title">User History</div><div class="ns-node-sub">what they said before</div></div>
    </div>
    <!-- Arrow -->
    <div style="display:flex;align-items:center;flex-shrink:0;padding:0 0.25rem;">
      <div style="width:2px;background:#2698ba;height:70%;align-self:center;"></div>
      <div style="font-size:1.4rem;color:#2698ba;line-height:1;">→</div>
    </div>
    <!-- Center: Model -->
    <div style="display:flex;align-items:center;flex-shrink:0;">
      <div class="ns-node ns-node-cyan" style="min-width:100px;text-align:center;">
        <div class="ns-node-title" style="font-size:1rem;">Model</div>
        <div class="ns-node-sub">LLM</div>
      </div>
    </div>
    <!-- Arrow -->
    <div style="display:flex;align-items:center;flex-shrink:0;padding:0 0.25rem;">
      <div style="font-size:1.4rem;color:#4fc97e;line-height:1;">→</div>
    </div>
    <!-- Right: Good answer -->
    <div style="display:flex;align-items:center;flex-shrink:0;">
      <div class="ns-node ns-node-green" style="min-width:110px;text-align:center;">
        <div class="ns-node-title" style="font-size:1rem;">Good answer</div>
        <div class="ns-node-sub">grounded, relevant</div>
      </div>
    </div>
  </div>
</div>

Prompt engineering asks: *"how do I phrase this question?"*

Context engineering asks: *"what does the model need to know before I even ask?"*

A basic LLM answers from its training data. A context-engineered agent:
- Checks your calendar before scheduling something
- Reads your previous emails before drafting a new one
- Fetches the latest docs before writing code

The difference is the *environment* you build around the model — not the model itself. This is why two teams using the same LLM can get wildly different results.


## Key Takeaways

**The core idea.** One complex prompt = one overwhelmed LLM. A chain of focused prompts = reliable, controllable output.

**The mechanism.** Each step outputs structured data (usually JSON) that feeds directly into the next step's prompt. Clean handoffs between steps are everything.

**The superpower.** Between LLM calls, you can run real code — validators, APIs, calculators, databases. The chain is a pipeline, not just a list of prompts.

**When to use it.** Whenever your task has more than two stages, requires external data, or would benefit from independent verification at each step.

> If your task would make an intern ask "which part do you want me to do first?" — it needs a chain.


## References

1. LangChain Expression Language — [python.langchain.com](https://python.langchain.com/v0.2/docs/core_modules/expression_language/)
2. LangGraph — [langchain-ai.github.io/langgraph](https://langchain-ai.github.io/langgraph/)
3. Prompt Chaining Guide — [promptingguide.ai](https://www.promptingguide.ai/techniques/chaining)
4. Crew AI — [docs.crewai.com](https://docs.crewai.com/)
5. Google Vertex AI Prompt Optimizer — [cloud.google.com](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/prompts/prompt-optimizer)

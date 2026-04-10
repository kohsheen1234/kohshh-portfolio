---
layout: post
title: "Chapter 12: Exception Handling and Recovery"
description: "Real-world agents fail. Networks time out, APIs return errors, databases go down, data arrives malformed. This chapter is about building agents that handle every failure gracefully — detecting it, recovering from it, and keeping the user informed throughout."
tags: agentic-ai llm exception-handling resilience
date: 2026-02-18
featured: true
author: Kohsheen Tiku
toc: true
mermaid:
  enabled: true
  zoomable: true
---

## Why Agents Break in the Real World

<div class="concept-box">
  <span class="concept-label">Before You Start — Key Terms Explained</span>
  <p><strong>Exception:</strong> An unexpected event that disrupts the normal flow of a program. In Python, exceptions are objects that represent errors — <code>ConnectionError</code> means the network failed, <code>ValueError</code> means the data had the wrong format, <code>TimeoutError</code> means a request took too long. When an exception occurs and isn't handled, the program crashes.</p>
  <p style="margin-top:0.5rem"><strong>try/except (Python's error handling):</strong> A code structure that lets you attempt an operation and gracefully handle any errors it raises. Inside <code>try</code> you write the risky code. Inside <code>except</code> you write what to do if it fails. The program doesn't crash — it follows your fallback path instead.</p>
  <p style="margin-top:0.5rem"><strong>Exponential backoff:</strong> A retry strategy where each retry waits longer than the previous one. Wait 1 second, then 2, then 4, then 8. This prevents "thundering herd" — where thousands of clients all retry simultaneously, overwhelming an already-struggling server.</p>
  <p style="margin-top:0.5rem"><strong>Graceful degradation:</strong> Providing reduced functionality instead of complete failure. A chatbot that can't access the customer database might still answer general questions — reduced capability, but still useful. Better than refusing to respond at all.</p>
  <p style="margin-top:0.5rem"><strong>Idempotency:</strong> A property of operations where calling them multiple times has the same effect as calling them once. GET requests are idempotent (reading data doesn't change it). POST requests often aren't (calling "send_email" twice sends two emails). Important for retry logic — only retry idempotent operations automatically.</p>
  <p style="margin-top:0.5rem"><strong>Circuit breaker:</strong> A pattern that automatically stops calling a failing service after a threshold of failures. Like an electrical circuit breaker that trips when it detects an overload. Prevents cascading failures where one broken service causes the entire system to hang waiting for responses that will never come.</p>
  <p style="margin-top:0.5rem"><strong>Fallback:</strong> An alternative approach that activates when the primary approach fails. If the precise GPS lookup fails, fall back to city-level location data. If the payment processor is down, fall back to a backup processor. Fallbacks ensure some functionality is preserved even when components fail.</p>
</div>

Every pattern in this series has operated in idealized conditions: tools work, APIs respond, data arrives in the expected format. But deploy an agent in production and reality is messier:

- The weather API returns a `503 Service Unavailable` during peak traffic
- The database query times out because another process is holding a lock
- The LLM returns JSON with a missing field your code expects
- The email service rejects the request because the recipient's inbox is full
- A third-party service changes its response format without notice
- The user provides malformed input that breaks a tool's parameter validation
- A network packet drops mid-request, leaving the connection in an ambiguous state

None of these are bugs in your agent's logic. They're the normal chaos of distributed systems. And a well-designed agent handles all of them — not by pretending they won't happen, but by anticipating them and planning responses.

The **Exception Handling and Recovery** pattern is about building agents that are **resilient** — capable of detecting failures, responding to them appropriately, and restoring operation — rather than **fragile** agents that crash on first contact with an unexpected input.

This distinction matters enormously for production deployment. An agent that handles failures gracefully is trustworthy. An agent that crashes unpredictably is a liability, regardless of how intelligent its core reasoning is.

---

## The Three Phases of Exception Management

Exception handling in agents follows a clear three-phase structure:

<div class="ns-diagram">
  <div class="ns-diagram-header">
    <span class="ns-diagram-label">EXCEPTION HANDLING AND RECOVERY — three-phase structure</span>
    <button class="ns-expand-btn" onclick="openNsDiagram(this)"><svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 5V1h4M11 7v4H7M1 5l4-4M11 7l-4 4"/></svg> Expand</button>
  </div>
  <div class="ns-diagram-body" style="padding:1.25rem 1.5rem;">
    <div class="ns-node ns-node-cyan" style="max-width:320px;">
      <div class="ns-node-title">Agent Attempts Action</div>
      <div class="ns-node-sub">Tool call, API request, database query, LLM invocation — any operation that interacts with an external system can fail.</div>
    </div>
    <div class="ns-arrow"></div>
    <div class="ns-decision" style="max-width:220px;">
      <div class="ns-node-title">Success?</div>
    </div>
    <div class="ns-arrow"></div>
    <div class="ns-branch-row" style="max-width:540px;">
      <div class="ns-branch">
        <span class="ns-label-green">Yes</span>
        <div class="ns-arrow ns-arrow-green"></div>
        <div class="ns-node ns-node-green"><div class="ns-node-title">Continue Normal Flow</div></div>
      </div>
      <div class="ns-branch">
        <span class="ns-label-red">No — exception raised</span>
        <div class="ns-arrow ns-arrow-red"></div>
        <div class="ns-phase" style="gap:0.4rem;">
          <div class="ns-phase-title">PHASE 1 — Error Detection</div>
          <div class="ns-node ns-node-red" style="max-width:none;">
            <div class="ns-node-title">Identify &amp; Classify the Error</div>
            <div class="ns-node-sub">What type? HTTP error, timeout, validation error, auth failure, data format error? Severity? Transient or permanent?</div>
          </div>
          <div class="ns-node ns-node-amber" style="max-width:none;">
            <div class="ns-node-title">PHASE 2 — Error Handling</div>
            <div class="ns-node-sub">Log → Retry (if transient) → Fallback (if retry exhausted) → Degrade gracefully → Notify</div>
          </div>
          <div class="ns-node ns-node-purple" style="max-width:none;">
            <div class="ns-node-title">PHASE 3 — Recovery</div>
            <div class="ns-node-sub">State rollback → Diagnosis → Self-correction / Replan → Escalate to human if unresolvable</div>
          </div>
        </div>
      </div>
    </div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-green" style="max-width:280px;">
      <div class="ns-node-title">Stable Operation Restored</div>
      <div class="ns-node-sub">Either with full functionality, reduced functionality, or having escalated to human — but always in a defined, controlled state.</div>
    </div>
  </div>
</div>

---

## Phase 1: Error Detection

You can't handle what you don't know about. Error detection is the surveillance layer — continuously monitoring for signals that indicate something has gone wrong.

### Types of Errors Agents Encounter

<div class="exc-types-wrapper">
  <div class="exc-type-grid">
    <div class="exc-type-card exc-type-network">
      <div class="exc-type-icon">🌐</div>
      <div class="exc-type-name">Network Errors</div>
      <div class="exc-type-desc">Connection refused, DNS resolution failure, SSL certificate expired, request timeout. The external service is unreachable — not necessarily broken, just unavailable right now.</div>
      <div class="exc-type-codes"><code>ConnectionError</code> · <code>TimeoutError</code> · <code>SSLError</code></div>
      <div class="exc-type-strategy">Usually transient → retry with backoff</div>
    </div>
    <div class="exc-type-card exc-type-api">
      <div class="exc-type-icon">⚡</div>
      <div class="exc-type-name">API / HTTP Errors</div>
      <div class="exc-type-desc">4xx errors (client mistakes: 400 Bad Request, 401 Unauthorized, 404 Not Found, 429 Rate Limited). 5xx errors (server problems: 500 Internal Error, 503 Unavailable). Each requires different handling.</div>
      <div class="exc-type-codes"><code>HTTPError</code> · status codes 4xx/5xx</div>
      <div class="exc-type-strategy">429/5xx → retry · 4xx → fix request or abort</div>
    </div>
    <div class="exc-type-card exc-type-data">
      <div class="exc-type-icon">📋</div>
      <div class="exc-type-name">Data / Format Errors</div>
      <div class="exc-type-desc">The API returned valid JSON but with different field names. The LLM output wasn't parseable as JSON. A required field is null. The date format changed. These require validation and format handling.</div>
      <div class="exc-type-codes"><code>JSONDecodeError</code> · <code>KeyError</code> · <code>ValueError</code></div>
      <div class="exc-type-strategy">Validate → parse defensively → fallback schema</div>
    </div>
    <div class="exc-type-card exc-type-llm">
      <div class="exc-type-icon">🤖</div>
      <div class="exc-type-name">LLM Output Errors</div>
      <div class="exc-type-desc">The LLM was asked for JSON but returned prose. The LLM generated a tool call with wrong parameter types. The output is logically incoherent. These are probabilistic failures — even with temperature=0, they occasionally occur.</div>
      <div class="exc-type-codes">Structural validation failures · Schema mismatch</div>
      <div class="exc-type-strategy">Validate output → retry with clarified prompt</div>
    </div>
    <div class="exc-type-card exc-type-logic">
      <div class="exc-type-icon">⚠️</div>
      <div class="exc-type-name">Logic / Semantic Errors</div>
      <div class="exc-type-desc">The agent took an action that is technically valid but semantically wrong — deleting the wrong record, sending to the wrong recipient, reading the wrong file. These are the hardest to detect because no exception is raised.</div>
      <div class="exc-type-codes">No Python exception — requires semantic validation</div>
      <div class="exc-type-strategy">Confirmation steps · human review for irreversible actions</div>
    </div>
    <div class="exc-type-card exc-type-resource">
      <div class="exc-type-icon">💾</div>
      <div class="exc-type-name">Resource Errors</div>
      <div class="exc-type-desc">Context window exceeded, rate limit hit, token budget exhausted, memory full, disk full. These are quota and capacity constraints, not bugs — but they require the same structured handling.</div>
      <div class="exc-type-codes"><code>ContextLengthError</code> · <code>RateLimitError</code></div>
      <div class="exc-type-strategy">Summarize context → reduce payload → queue request</div>
    </div>
  </div>
</div>

<style>
.exc-type-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.85rem; margin: 1.5rem 0; }
.exc-type-card { border: 1px solid var(--global-divider-color); border-radius: 8px; padding: 1rem; display: flex; flex-direction: column; gap: 0.4rem; background: rgba(128,128,128,0.04); }
.exc-type-network { border-left: 3px solid #2698ba; }
.exc-type-api     { border-left: 3px solid #e6a817; }
.exc-type-data    { border-left: 3px solid #c97af2; }
.exc-type-llm     { border-left: 3px solid #4fc97e; }
.exc-type-logic   { border-left: 3px solid #ff6b6b; }
.exc-type-resource { border-left: 3px solid #7dcfff; }
.exc-type-icon { font-size: 1.1rem; }
.exc-type-name { font-size: 0.85rem; font-weight: 700; color: var(--global-text-color); }
.exc-type-desc { font-size: 0.78rem; color: var(--global-text-color-light); line-height: 1.5; }
.exc-type-codes { font-size: 0.68rem; font-family: monospace; color: #7dcfff; }
.exc-type-strategy { font-size: 0.68rem; font-family: monospace; color: #4fc97e; margin-top: auto; padding-top: 0.3rem; border-top: 1px solid var(--global-divider-color); }
</style>

---

## Phase 2: Error Handling Strategies

Once an error is detected, you need a playbook — a structured set of responses based on the error type and severity. The five strategies below cover the full range from "this will resolve itself" to "this needs a human."

### Strategy 1: Retry with Exponential Backoff

The most common strategy for transient errors. The operation failed temporarily — wait a moment and try again.

**Why exponential backoff?** If your request failed because the server is overloaded and 10,000 other clients all retry at exactly the same time (1 second later), you've just made the overload worse. Exponential backoff spreads retries out: different clients wait different amounts before retrying, reducing the "retry storm" problem.

<div class="exc-backoff-wrapper">
  <div class="exc-backoff-header">
    <span class="exc-backoff-title">EXPONENTIAL BACKOFF VISUALIZATION</span>
    <button class="exc-backoff-btn" id="backoffRunBtn">▶ Simulate Retry</button>
  </div>
  <div class="exc-backoff-body">
    <div class="exc-backoff-timeline" id="backoffTimeline"></div>
    <div class="exc-backoff-result" id="backoffResult" style="display:none"></div>
  </div>
</div>

<style>
.exc-backoff-wrapper { border: 1px solid var(--global-divider-color); border-radius: 10px; overflow: hidden; margin: 1.5rem 0; }
.exc-backoff-header { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1.1rem; border-bottom: 1px solid var(--global-divider-color); background: rgba(128,128,128,0.05); }
.exc-backoff-title { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--global-text-color); }
.exc-backoff-btn { font-family: monospace; font-size: 0.72rem; padding: 0.3rem 0.8rem; border-radius: 4px; border: 1px solid var(--global-divider-color); background: transparent; color: var(--global-text-color); cursor: pointer; }
.exc-backoff-btn:hover { background: rgba(38,152,186,0.12); border-color:#2698ba; color:#2698ba; }
.exc-backoff-body { padding: 1.1rem; display: flex; flex-direction: column; gap: 0.5rem; }
.exc-backoff-timeline { display: flex; flex-direction: column; gap: 0.4rem; }
.exc-attempt { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0.75rem; border-radius: 6px; border: 1px solid var(--global-divider-color); background: rgba(128,128,128,0.03); animation: bofIn 0.3s ease; font-size: 0.8rem; }
@keyframes bofIn { from { opacity:0; transform:translateX(-6px); } to { opacity:1; transform:none; } }
.exc-attempt.fail { border-color: rgba(255,107,107,0.3); background: rgba(255,107,107,0.05); }
.exc-attempt.success { border-color: rgba(79,201,126,0.3); background: rgba(79,201,126,0.07); }
.exc-attempt-num { font-family: monospace; font-size: 0.65rem; font-weight: 700; min-width: 70px; flex-shrink: 0; color: var(--global-text-color-light); }
.exc-attempt-bar { height: 6px; border-radius: 3px; flex-shrink: 0; }
.exc-attempt-wait { font-size: 0.72rem; font-family: monospace; color: var(--global-text-color-light); flex-shrink: 0; }
.exc-attempt-status { font-size: 0.72rem; font-family: monospace; flex-shrink: 0; }
.exc-attempt.fail .exc-attempt-status { color: #ff6b6b; }
.exc-attempt.success .exc-attempt-status { color: #4fc97e; }
.exc-backoff-result { padding: 0.55rem 0.85rem; border-radius: 6px; font-size: 0.8rem; font-family: monospace; text-align: center; }
.exc-backoff-result.success { background: rgba(79,201,126,0.08); color: #4fc97e; border: 1px solid rgba(79,201,126,0.2); }
.exc-backoff-result.fail    { background: rgba(255,107,107,0.08); color: #ff6b6b; border: 1px solid rgba(255,107,107,0.2); }
</style>

<script>
document.addEventListener('DOMContentLoaded', function(){
  var btn = document.getElementById('backoffRunBtn');
  if (!btn) return;
  var running = false;

  // Simulate: attempts 1-3 fail (503), attempt 4 succeeds
  var ATTEMPTS = [
    { wait: '0s (immediate)', status: '503 Service Unavailable', fail: true,  barW: 20 },
    { wait: '1s wait',        status: '503 Service Unavailable', fail: true,  barW: 40 },
    { wait: '2s wait',        status: '503 Service Unavailable', fail: true,  barW: 70 },
    { wait: '4s wait',        status: '200 OK — Success!',       fail: false, barW: 100 },
  ];

  btn.addEventListener('click', async function(){
    if (running) return;
    running = true;
    btn.textContent = '⏳ Running…';
    btn.disabled = true;

    var timeline = document.getElementById('backoffTimeline');
    var result   = document.getElementById('backoffResult');
    timeline.innerHTML = '';
    result.style.display = 'none';

    for (var i = 0; i < ATTEMPTS.length; i++) {
      await new Promise(function(r){ setTimeout(r, 700); });
      var a = ATTEMPTS[i];
      var div = document.createElement('div');
      div.className = 'exc-attempt ' + (a.fail ? 'fail' : 'success');
      div.innerHTML =
        '<span class="exc-attempt-num">Attempt ' + (i+1) + '</span>' +
        '<div class="exc-attempt-bar" style="width:' + a.barW + 'px;background:' + (a.fail ? '#ff6b6b' : '#4fc97e') + ';"></div>' +
        '<span class="exc-attempt-wait">' + a.wait + '</span>' +
        '<span class="exc-attempt-status">' + a.status + '</span>';
      timeline.appendChild(div);
    }

    await new Promise(function(r){ setTimeout(r, 400); });
    result.className = 'exc-backoff-result success';
    result.textContent = 'Succeeded on attempt 4 after 7s total wait (0 + 1 + 2 + 4 = 7s). Exponential backoff formula: wait = base_delay × (2^attempt)';
    result.style.display = 'block';

    running = false;
    btn.textContent = '↺ Replay';
    btn.disabled = false;
  });
});
</script>

Here's how to implement retry with exponential backoff in Python:

```python
import time
import random

def retry_with_backoff(func, max_retries=4, base_delay=1.0, max_delay=60.0):
    """
    Execute `func` with exponential backoff on failure.

    Args:
        func: The callable to retry. Should raise an exception on failure.
        max_retries: Maximum number of retry attempts (not counting first try).
        base_delay: Initial wait time in seconds.
        max_delay: Maximum wait time cap in seconds.
    Returns:
        The result of func() if it eventually succeeds.
    Raises:
        The last exception raised by func if all retries are exhausted.
    """
    last_exception = None

    for attempt in range(max_retries + 1):  # +1 for the initial try
        try:
            return func()  # Try the operation

        except (ConnectionError, TimeoutError) as e:
            # These are transient — worth retrying
            last_exception = e
            if attempt == max_retries:
                break  # No more retries — fall through to raise

            # Exponential backoff with jitter
            # jitter = random noise to prevent synchronized retries from multiple clients
            wait_time = min(base_delay * (2 ** attempt), max_delay)
            jitter = random.uniform(0, wait_time * 0.1)  # ±10% randomness
            actual_wait = wait_time + jitter

            print(f"Attempt {attempt + 1} failed: {e}. Waiting {actual_wait:.1f}s before retry...")
            time.sleep(actual_wait)

        except Exception as e:
            # Non-transient errors (auth failures, invalid requests) — don't retry
            raise  # Re-raise immediately, no retry

    raise last_exception  # All retries exhausted — propagate final exception
```

> **Why separate `ConnectionError/TimeoutError` from the general `Exception`?** Retrying makes sense for transient failures — the server is temporarily busy, the network had a hiccup. It makes no sense for permanent failures — a `401 Unauthorized` error won't become authorized just because you waited and tried again. Separate exception types for different retry policies prevents wasting retries on errors that will never resolve themselves.

> **What is "jitter"?** Without jitter, if 1,000 clients all hit a rate limit at the same moment and all back off for exactly 1 second, they all retry at exactly the same moment — still overwhelming the server. Adding random noise (±10% of the wait time) spreads their retries across a window, significantly reducing the "synchronized retry storm" problem.

### Strategy 2: Fallback Mechanisms

When retries are exhausted, activate an alternative approach. Fallbacks are pre-planned alternatives that provide some value when the primary approach is unavailable.

```python
def get_location_info(address: str) -> dict:
    """
    Attempt precise location lookup, fall back to city-level if unavailable.
    """
    # Primary: precise geocoding API
    try:
        result = precise_location_api.lookup(address)
        return {"precision": "precise", "data": result}

    except (APIError, TimeoutError) as e:
        print(f"Precise lookup failed: {e}. Activating fallback...")

        # Fallback 1: city-level lookup from a different provider
        try:
            city = extract_city_from_address(address)
            result = city_lookup_api.get(city)
            return {"precision": "city-level", "data": result, "degraded": True}

        except Exception as fallback_error:
            print(f"City-level fallback also failed: {fallback_error}")

            # Fallback 2: cached/static data
            cached = location_cache.get(address)
            if cached:
                return {"precision": "cached", "data": cached, "degraded": True, "stale": True}

            # No fallback available
            return {"precision": "none", "error": str(e), "degraded": True}
```

> **The fallback hierarchy.** Good fallback design has multiple levels: (1) primary approach, (2) alternative service with full data, (3) service with reduced data, (4) cached data, (5) graceful failure message. Each level provides less value but more availability. The agent always has a path forward.

> **Mark degraded results clearly.** The `"degraded": True` flag in the return value tells downstream code and the LLM that this result is less reliable than normal. The LLM can then communicate appropriately to the user: "I found city-level location data — detailed address lookup was temporarily unavailable."

### Strategy 3: Graceful Degradation

Provide partial functionality rather than complete failure. When one component fails, other components continue working.

```python
def process_user_request(user_query: str, user_id: str) -> dict:
    """
    Process request with graceful degradation of individual components.
    """
    response = {"query": user_query, "components_used": []}

    # Attempt 1: Personalization (nice-to-have, not critical)
    try:
        preferences = user_preference_db.get(user_id)
        response["personalization"] = preferences
        response["components_used"].append("personalization")
    except Exception as e:
        # Personalization failed — continue without it
        log_warning(f"Personalization unavailable for {user_id}: {e}")
        response["personalization"] = None  # Use defaults

    # Attempt 2: Real-time data (important, but not blocking)
    try:
        live_data = market_data_api.get_latest()
        response["market_data"] = live_data
        response["components_used"].append("real_time_data")
    except Exception as e:
        # Fall back to cached data from last successful fetch
        cached = cache.get("market_data", max_age_seconds=300)
        if cached:
            response["market_data"] = cached
            response["data_freshness"] = "cached (may be up to 5min old)"
            response["components_used"].append("cached_data")
        else:
            response["market_data"] = None
            response["data_freshness"] = "unavailable"

    # Core functionality — this must succeed
    response["answer"] = llm.generate(
        query=user_query,
        context=response
    )
    response["components_used"].append("llm_core")

    return response
```

> **Why not catch everything at the top level?** A single `try/except` around the entire function would either catch everything (and lose detail about what failed) or re-raise on first failure (no degradation). Component-level try/except gives you surgical control: some components are optional (personalization), some have fallbacks (real-time data → cache), and some are required (the LLM call). Each component's failure is handled exactly as its criticality demands.

### Strategy 4: Circuit Breaker

The circuit breaker pattern prevents cascading failures by automatically stopping calls to a consistently failing service.

```python
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum

class CircuitState(Enum):
    CLOSED   = "closed"    # Normal operation — calls pass through
    OPEN     = "open"      # Failing — calls blocked immediately
    HALF_OPEN = "half_open" # Testing — one call allowed to check recovery

@dataclass
class CircuitBreaker:
    failure_threshold: int = 5         # Open after this many consecutive failures
    recovery_timeout: int = 30          # Seconds to wait before half-open
    state: CircuitState = CircuitState.CLOSED
    failure_count: int = 0
    last_failure_time: datetime = None

    def call(self, func, *args, **kwargs):
        if self.state == CircuitState.OPEN:
            # Check if recovery timeout has elapsed
            if datetime.now() - self.last_failure_time > timedelta(seconds=self.recovery_timeout):
                self.state = CircuitState.HALF_OPEN
                print("Circuit HALF-OPEN: testing if service recovered...")
            else:
                raise Exception("Circuit OPEN: service unavailable. Skipping call to prevent cascade.")

        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise

    def _on_success(self):
        self.failure_count = 0
        if self.state == CircuitState.HALF_OPEN:
            print("Circuit CLOSED: service has recovered.")
        self.state = CircuitState.CLOSED

    def _on_failure(self):
        self.failure_count += 1
        self.last_failure_time = datetime.now()
        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN
            print(f"Circuit OPENED after {self.failure_count} failures. Will retry in {self.recovery_timeout}s.")
```

> **Why is the circuit breaker needed when you already have retry logic?** Without a circuit breaker, every request retries independently — even if you *know* the service has been failing for the past 10 minutes. The circuit breaker creates shared knowledge: once enough requests have failed, *all* subsequent requests immediately fail fast rather than waiting for a timeout. This frees up resources and prevents the cascade where one slow service causes the entire system to pile up with waiting threads.

> **The three states explained:** CLOSED = normal (all calls pass through). OPEN = failed (all calls immediately rejected, no actual call made). HALF_OPEN = recovery probe (one call allowed — if it succeeds, CLOSED; if it fails, back to OPEN with refreshed timeout).

### Strategy 5: Logging and Observability

You cannot improve what you cannot see. Comprehensive logging transforms failures from mysteries into actionable data.

```python
import logging
import traceback
import json
from datetime import datetime

# Configure structured logging
logger = logging.getLogger(__name__)

def log_agent_error(
    error: Exception,
    agent_name: str,
    action: str,
    inputs: dict,
    attempt_number: int,
    context: dict = None
):
    """
    Log a structured error record for debugging and monitoring.
    """
    error_record = {
        "timestamp":      datetime.utcnow().isoformat(),
        "agent":          agent_name,
        "action":         action,
        "attempt":        attempt_number,
        "error_type":     type(error).__name__,
        "error_message":  str(error),
        "error_traceback": traceback.format_exc(),
        "inputs":         inputs,    # What was the agent trying to do?
        "context":        context,   # What was the system state?
    }

    # JSON format enables querying with log analytics tools (Splunk, Datadog, etc.)
    logger.error(json.dumps(error_record))
```

> **Why structured JSON logging instead of plain text?** Plain text logs like `"Error: connection failed at 14:32"` are readable but not queryable. JSON logs like `{"error_type": "ConnectionError", "agent": "billing_agent", "attempt": 3}` can be filtered, aggregated, and alerted on by log management tools. You can ask: "Show me all `ConnectionError` events from `billing_agent` in the last hour with more than 2 retries" — impossible with plain text, trivial with structured JSON.

---

## Phase 3: Recovery Strategies

Handling an error keeps the system running. Recovery restores it to full health.

### State Rollback

When an agent performs multiple steps and fails partway through, incomplete actions can leave the system in a corrupted state. State rollback reverses completed steps.

```python
class TransactionManager:
    """
    Manages multi-step agent operations with rollback on failure.
    Like a database transaction — either everything succeeds, or everything rolls back.
    """

    def __init__(self):
        self.completed_steps = []  # Stack of (step_name, undo_function) pairs

    def execute_step(self, step_name: str, action, undo_action):
        """Execute one step and register its undo operation."""
        try:
            result = action()
            self.completed_steps.append((step_name, undo_action))
            print(f"✓ Step completed: {step_name}")
            return result
        except Exception as e:
            print(f"✗ Step failed: {step_name} — {e}")
            self.rollback_all()
            raise

    def rollback_all(self):
        """Undo all completed steps in reverse order."""
        print(f"Rolling back {len(self.completed_steps)} completed steps...")
        while self.completed_steps:
            step_name, undo_fn = self.completed_steps.pop()
            try:
                undo_fn()
                print(f"  ↩ Rolled back: {step_name}")
            except Exception as e:
                # Log rollback failure but continue trying other rollbacks
                print(f"  ⚠ Rollback failed for {step_name}: {e}")


# Usage example: booking a travel package
def book_travel_package(flight_id, hotel_id, car_id):
    tx = TransactionManager()
    try:
        # Each step: (action, undo_action)
        tx.execute_step(
            "book_flight",
            action   = lambda: flight_api.book(flight_id),
            undo_action = lambda: flight_api.cancel(flight_id)
        )
        tx.execute_step(
            "book_hotel",
            action   = lambda: hotel_api.book(hotel_id),
            undo_action = lambda: hotel_api.cancel(hotel_id)
        )
        tx.execute_step(
            "book_car",
            action   = lambda: car_api.book(car_id),
            undo_action = lambda: car_api.cancel(car_id)
        )
        print("✅ All bookings successful!")

    except Exception as e:
        print(f"❌ Booking failed: {e}. All completed bookings have been cancelled.")
        raise
```

> **Why reverse order for rollback?** If you completed steps A → B → C and step D fails, you need to undo C before B, and B before A. Undoing in original order could leave dependencies in place that make the undo impossible. Think of building with Lego: you take apart the last piece first, not the first piece first.

> **Why continue rolling back even if a rollback step fails?** Because the goal of rollback is to restore the most complete clean state possible. If hotel rollback fails but car rollback succeeds, you've at least recovered the car booking cost. Stopping at the first rollback failure would leave more resources locked.

---

## The ADK Implementation: SequentialAgent with Fallback

Google ADK's `SequentialAgent` provides a natural structure for implementing the primary → fallback → response pattern using session state as the coordination mechanism.

```python
from google.adk.agents import Agent, SequentialAgent
```

> **Why use a SequentialAgent for exception handling?** Each "handler" in the exception handling pipeline is a distinct responsibility: the primary handler tries the best approach, the fallback handler activates if needed, and the response handler presents whatever result was obtained. `SequentialAgent` guarantees these run in order and share state through `session.state` — making the coordination explicit and debuggable.

```python
# Agent 1: Attempts the primary approach — high precision
primary_handler = Agent(
    name        = "primary_handler",
    model       = "gemini-2.0-flash-exp",
    instruction = """
Your job is to get precise location information.
Use the get_precise_location_info tool with the user's provided address.
If the tool succeeds, store the result in state["location_result"].
If the tool fails for any reason, store True in state["primary_location_failed"].
Always set state["primary_location_failed"] to either True or False.
""",
    tools = [get_precise_location_info]
)
```

> **Why store the failure signal in `state["primary_location_failed"]`?** The secondary agent needs to know whether the primary succeeded or failed. Session state is the shared communication channel between sequential agents in ADK — it's the equivalent of a shared variable that both agents can read and write. Without this explicit signal, the fallback agent would have no way to know whether to activate.

> **Why "Always set state['primary_location_failed'] to either True or False"?** This is defensive instruction design. Without it, the agent might only set the flag when it fails, leaving it unset (and thus `None`) when it succeeds. The fallback agent then can't reliably distinguish "succeeded" from "flag not set." Explicit True/False handling is more reliable than absence/presence.

```python
# Agent 2: Conditional fallback — only activates if primary failed
fallback_handler = Agent(
    name        = "fallback_handler",
    model       = "gemini-2.0-flash-exp",
    instruction = """
Check the value of state["primary_location_failed"].

If it is True:
  - Extract the city name from the user's original query
  - Use the get_general_area_info tool with that city name
  - Store the result in state["location_result"]
  - Store "city-level (degraded)" in state["data_precision"]

If it is False:
  - Do nothing. The primary handler already succeeded.
""",
    tools = [get_general_area_info]
)
```

> **Why check state in the instruction rather than in code?** The conditional logic ("if failed, activate; if not, do nothing") is expressed in natural language because the agent's LLM reads it and decides what to do. This is the ADK way — the LLM is the control flow mechanism for agent behavior. Alternative: pre-check in Python and skip the agent if not needed, which is also valid and more efficient for deterministic conditions.

```python
# Agent 3: Presents results regardless of which path succeeded
response_agent = Agent(
    name        = "response_agent",
    model       = "gemini-2.0-flash-exp",
    instruction = """
Review the location information in state["location_result"].

Present this information clearly to the user.
If state["data_precision"] is "city-level (degraded)", mention that
you're showing city-level data because detailed lookup was temporarily unavailable.

If state["location_result"] is empty or does not exist, apologize that
you could not retrieve location information and suggest trying again later.
""",
    tools = []  # This agent only reasons — no tool calls needed
)
```

> **Why does the response agent have `tools=[]`?** The response agent's job is purely to interpret and communicate the state — it doesn't need to call any tools. Giving it an empty tool list makes this explicit and prevents the LLM from attempting unnecessary tool calls. It's also more efficient — no tool schema is sent to the model.

> **Why have a separate response agent at all?** The response format shouldn't be the responsibility of either the primary or fallback handler — they're focused on data retrieval. Separating presentation from retrieval means: if you want to change the response format (add more context, translate to another language, format as HTML), you only change the response agent without touching the retrieval logic.

```python
# Assemble: SequentialAgent ensures guaranteed execution order
robust_location_agent = SequentialAgent(
    name       = "robust_location_agent",
    sub_agents = [primary_handler, fallback_handler, response_agent]
)
```

> **What happens if even the fallback fails?** The response agent is designed to handle this: `"If state['location_result'] is empty or does not exist, apologize..."` This is the final safety net — no matter what happens upstream, the response agent always runs and always produces a response that makes sense to the user. The user never sees an unhandled exception; they always get a coherent message.

### The Complete Flow Visualized

```mermaid
graph TD
    U([User: "Find info for 123 Main St"]) --> PA[primary_handler]
    PA -->|tool call| GPS[get_precise_location_info]
    GPS -->|success| S1[state: location_result = precise data<br>primary_location_failed = False]
    GPS -->|error: 503| S2[state: primary_location_failed = True]
    S1 --> FB[fallback_handler]
    S2 --> FB
    FB -->|failed=False| SKIP[Do nothing — primary succeeded]
    FB -->|failed=True| CITY[get_general_area_info tool]
    CITY --> S3[state: location_result = city data<br>data_precision = city-level]
    SKIP --> RA[response_agent]
    S3 --> RA
    RA --> OUT([User sees: location info with appropriate context])
    style PA fill:#141b2d,stroke:#2698ba,color:#e0e0e0
    style FB fill:#141b2d,stroke:#e6a817,color:#e0e0e0
    style RA fill:#141b2d,stroke:#4fc97e,color:#e0e0e0
    style OUT fill:#141b2d,stroke:#4fc97e,color:#e0e0e0
```

---

## Live Failure Simulation

<div class="exc-sim-wrapper">
  <div class="exc-sim-header">
    <span class="exc-sim-title">EXCEPTION HANDLING DEMO — simulate tool failure and recovery</span>
    <div style="display:flex;gap:0.5rem;">
      <select class="exc-sim-select" id="excScenario">
        <option value="0">Scenario: API timeout → retry → success</option>
        <option value="1">Scenario: Auth failure → abort immediately</option>
        <option value="2">Scenario: 3 retries exhausted → fallback activates</option>
        <option value="3">Scenario: Malformed JSON → retry with clarified prompt</option>
      </select>
      <button class="exc-sim-btn" id="excSimRunBtn">▶ Run</button>
    </div>
  </div>
  <div class="exc-sim-body" id="excSimBody">
    <div class="exc-sim-hint">Select a scenario above and click Run to see how the agent handles it.</div>
  </div>
</div>

<style>
.exc-sim-wrapper { border: 1px solid var(--global-divider-color); border-radius: 10px; overflow: hidden; margin: 2rem 0; }
.exc-sim-header { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1.1rem; border-bottom: 1px solid var(--global-divider-color); background: rgba(128,128,128,0.05); flex-wrap: wrap; gap: 0.5rem; }
.exc-sim-title { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--global-text-color); }
.exc-sim-select { font-family: monospace; font-size: 0.7rem; padding: 0.28rem 0.6rem; border-radius: 4px; border: 1px solid var(--global-divider-color); background: var(--global-bg-color); color: var(--global-text-color); cursor: pointer; }
.exc-sim-btn { font-family: monospace; font-size: 0.72rem; padding: 0.3rem 0.75rem; border-radius: 4px; border: 1px solid var(--global-divider-color); background: transparent; color: var(--global-text-color); cursor: pointer; }
.exc-sim-btn:hover { background: rgba(38,152,186,0.12); border-color:#2698ba; color:#2698ba; }
.exc-sim-body { padding: 1rem 1.1rem; display: flex; flex-direction: column; gap: 0.45rem; min-height: 80px; }
.exc-sim-hint { font-size: 0.8rem; color: var(--global-text-color-light); font-style: italic; }
.exc-sim-event { padding: 0.5rem 0.75rem; border-radius: 5px; font-size: 0.78rem; border: 1px solid var(--global-divider-color); animation: excEvIn 0.25s ease; }
@keyframes excEvIn { from { opacity:0; } to { opacity:1; } }
.exc-ev-attempt { background: rgba(128,128,128,0.05); }
.exc-ev-error   { background: rgba(255,107,107,0.06); border-color: rgba(255,107,107,0.2); }
.exc-ev-retry   { background: rgba(230,168,23,0.06);  border-color: rgba(230,168,23,0.2); }
.exc-ev-fallback{ background: rgba(201,122,242,0.06); border-color: rgba(201,122,242,0.2); }
.exc-ev-success { background: rgba(79,201,126,0.07);  border-color: rgba(79,201,126,0.2); }
.exc-ev-abort   { background: rgba(255,107,107,0.1);  border-color: rgba(255,107,107,0.3); }
</style>

<script>
var EXC_SCENARIOS = [
  [
    { type:'attempt', text:'🔧 Calling weather_api.get(city="London")...' },
    { type:'error',   text:'❌ Error: TimeoutError — request exceeded 10s timeout' },
    { type:'retry',   text:'⏱ Transient error detected. Waiting 1s before retry 1/3...' },
    { type:'attempt', text:'🔧 Retry 1: Calling weather_api.get(city="London")...' },
    { type:'success', text:'✅ Success on retry 1. Response: {"temp": 15, "condition": "Cloudy"}' },
  ],
  [
    { type:'attempt', text:'🔧 Calling crm_api.get_customer(id="12345")...' },
    { type:'error',   text:'❌ Error: HTTP 401 Unauthorized — API key is invalid or expired' },
    { type:'abort',   text:'🚫 Permanent error (4xx) — retrying will not help. Aborting and alerting operator.' },
  ],
  [
    { type:'attempt', text:'🔧 Calling payment_processor.charge(amount=99.99)...' },
    { type:'error',   text:'❌ Error: HTTP 503 Service Unavailable' },
    { type:'retry',   text:'⏱ Waiting 1s before retry 1/3...' },
    { type:'attempt', text:'🔧 Retry 1: payment_processor.charge(amount=99.99)...' },
    { type:'error',   text:'❌ Error: HTTP 503 Service Unavailable' },
    { type:'retry',   text:'⏱ Waiting 2s before retry 2/3...' },
    { type:'attempt', text:'🔧 Retry 2: payment_processor.charge(amount=99.99)...' },
    { type:'error',   text:'❌ Error: HTTP 503 Service Unavailable' },
    { type:'retry',   text:'⏱ Waiting 4s before retry 3/3...' },
    { type:'attempt', text:'🔧 Retry 3: payment_processor.charge(amount=99.99)...' },
    { type:'error',   text:'❌ Error: HTTP 503 — Max retries exhausted' },
    { type:'fallback',text:'🔄 Activating fallback: backup_payment_processor...' },
    { type:'success', text:'✅ Fallback succeeded. Transaction ID: txn_backup_7821. User notified that backup processor was used.' },
  ],
  [
    { type:'attempt', text:'🤖 Requesting JSON output from LLM...' },
    { type:'error',   text:'❌ JSONDecodeError: LLM returned prose instead of JSON: "The answer is 42 and the unit is meters..."' },
    { type:'retry',   text:'🔧 Retry with clarified prompt: "You MUST respond with ONLY valid JSON. No prose. Example: {\"value\": 42, \"unit\": \"meters\"}"' },
    { type:'success', text:'✅ Valid JSON received on retry: {"value": 42, "unit": "meters", "confidence": 0.95}' },
  ]
];

document.addEventListener('DOMContentLoaded', function(){
  var runBtn = document.getElementById('excSimRunBtn');
  var select = document.getElementById('excScenario');
  if (!runBtn) return;
  var running = false;
  var TYPE_CLASS = { attempt:'exc-ev-attempt', error:'exc-ev-error', retry:'exc-ev-retry', fallback:'exc-ev-fallback', success:'exc-ev-success', abort:'exc-ev-abort' };

  runBtn.addEventListener('click', async function(){
    if (running) return;
    running = true;
    runBtn.textContent = '⏳'; runBtn.disabled = true;
    var body = document.getElementById('excSimBody');
    body.innerHTML = '';
    var scenario = EXC_SCENARIOS[parseInt(select.value)];
    for (var i = 0; i < scenario.length; i++) {
      await new Promise(function(r){ setTimeout(r, 500); });
      var e = scenario[i];
      var div = document.createElement('div');
      div.className = 'exc-sim-event exc-ev-' + e.type;
      div.textContent = e.text;
      body.appendChild(div);
    }
    running = false; runBtn.textContent = '↺ Run'; runBtn.disabled = false;
  });
});
</script>

---

## Common Mistakes in Exception Handling

**Mistake 1: Catching everything with a bare `except Exception`.** A single catch-all handler loses all information about what went wrong. Different errors need different responses — a `401 Unauthorized` needs credentials fixed; a `503` needs a retry. Catch specific exception types and handle each appropriately.

**Mistake 2: Retrying non-idempotent operations.** If `send_email()` fails partway, should you retry it? Only if the email service guarantees idempotency (same message ID = only sent once). Otherwise, retrying sends duplicate emails. Always ask: "Is it safe to call this twice?" before adding retry logic.

**Mistake 3: Swallowing exceptions silently.** `except Exception: pass` is one of the most dangerous patterns in programming. The error is hidden from logs, from monitoring, from the developer, and from the user. The system appears to be running correctly while actually failing silently. Always log exceptions, even if you handle them gracefully.

**Mistake 4: Logging after a failed rollback, not the original error.** If your rollback fails, the error you log is the rollback failure — but the root cause is the original operation failure. Log the original error *first*, then attempt rollback, then log any rollback failures separately.

**Mistake 5: No circuit breaker for external dependencies.** Without circuit breakers, a slow or failed external service causes your agent to pile up with threads waiting for timeouts. Each request waits 10 seconds before failing — with 100 concurrent users, you suddenly have 1,000 seconds of accumulated wait time. Circuit breakers fail fast, freeing resources immediately.

**Mistake 6: Not testing failure paths.** Error handling code is only tested when things go wrong — which means in production, when you least want surprises. Deliberately inject failures in testing: mock the API to return 503, send malformed JSON, trigger timeouts. Ensure your error handling actually works before deploying.

---

## At a Glance

<div class="exc-summary-card">
  <div class="exc-summary-col">
    <div class="exc-summary-label">WHAT</div>
    <p>A structured approach to detecting, handling, and recovering from operational failures in AI agents — covering network errors, API failures, data format errors, LLM output failures, and logic errors, with specific strategies for each.</p>
  </div>
  <div class="exc-summary-divider"></div>
  <div class="exc-summary-col">
    <div class="exc-summary-label">WHY</div>
    <p>Real-world systems fail constantly. An agent without exception handling is fragile — one API error crashes the entire conversation. An agent with exception handling is resilient — it detects problems, recovers where possible, degrades gracefully where not, and always leaves the user informed.</p>
  </div>
  <div class="exc-summary-divider"></div>
  <div class="exc-summary-col">
    <div class="exc-summary-label">RULE OF THUMB</div>
    <p>Use this pattern for any production agent that interacts with external systems — which means every production agent. The implementation complexity scales with the criticality of the application: more retries, more fallbacks, and more human escalation paths for higher-stakes systems.</p>
  </div>
</div>

<style>
.exc-summary-card { display: flex; border: 1px solid var(--global-divider-color); border-radius: 10px; overflow: hidden; margin: 1.5rem 0; }
@media (max-width: 640px) { .exc-summary-card { flex-direction: column; } }
.exc-summary-col { flex: 1; padding: 1.1rem; background: rgba(128,128,128,0.03); }
.exc-summary-col p { font-size: 0.8rem; color: var(--global-text-color-light); line-height: 1.6; margin: 0.4rem 0 0; }
.exc-summary-divider { width: 1px; background: var(--global-divider-color); flex-shrink: 0; }
.exc-summary-label { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.12em; color: #ff6b6b; }
</style>

---

## Key Takeaways

- **Expect failures, design for them.** Production agents encounter network timeouts, API errors, malformed data, LLM output failures, and resource exhaustion constantly. These are not edge cases — they are normal operating conditions. Design for them explicitly, not as an afterthought.

- **Classify errors before handling them.** Transient errors (network glitches, rate limits, server overload) warrant retries. Permanent errors (authentication failures, invalid requests, missing resources) should fail fast — retrying wastes time and resources. Know the difference.

- **Exponential backoff with jitter is the right default retry strategy.** Linear backoff creates retry storms. Exponential backoff spreads load. Jitter (randomization) prevents synchronized retries from multiple clients. The formula: `wait = base × 2^attempt + random(0, base × 0.1)`.

- **Fallback hierarchies provide resilience in depth.** Primary approach fails? Try alternative service. That fails? Use cached data. That fails? Return a graceful degradation message. Each level provides less value but more availability. Design the full hierarchy before deployment.

- **Circuit breakers prevent cascading failures.** When a service is consistently failing, stop calling it immediately rather than making every request wait for a timeout. Fail fast, preserve resources, check periodically whether the service has recovered.

- **Log everything, swallow nothing.** `except Exception: pass` is production debt. Every caught exception should be logged with structured context (agent name, action, inputs, error type, traceback). This data is essential for diagnosing production issues.

- **State rollback is critical for multi-step operations.** If a 5-step workflow fails at step 3, steps 1 and 2 need to be undone — otherwise you have partial, corrupted state. Use the transaction pattern: register undo operations at each step, roll back in reverse order on failure.

- **In ADK, use SequentialAgent + session state for primary/fallback flows.** The primary handler sets `state["failed"] = True/False`. The fallback handler reads this signal and activates only if needed. The response agent presents results regardless of which path was taken. Explicit state signaling makes the coordination debuggable.

---

*Next up — Chapter 13: Human-in-the-Loop, where agents pause at critical decision points, present their reasoning, and request human approval before taking irreversible actions.*

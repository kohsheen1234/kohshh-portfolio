---
layout: post
title: "Chapter 9: AI Control — Safety Without Trusting the Model"
description: "Alignment tries to make models that won't betray you. Control assumes the model might, and engineers deployment so safety doesn't depend on the answer. This chapter walks through I/O filtering, Constitutional Classifiers, trusted/untrusted model splits, and the broader control paradigm."
tags: ai-safety control input-output-filtering constitutional-classifiers trusted-untrusted defense-in-depth
date: 2026-03-28
featured: true
author: Kohsheen Tiku
toc: true
mermaid:
  enabled: true
  zoomable: true
---

## The Bet Behind Control

Alignment work (Chapters 2, 3, 7) bets on training models that *don't want* to betray their operators. AI Control — the research agenda associated with Greenblatt, Shlegeris, and Redwood Research — accepts that this bet may not pay off in time, and asks a different question:

> **If the model might be misaligned, what deployment design makes that not catastrophic?**

The reframing is decisive. Control doesn't ask "is the model aligned?" It asks "given that we can't verify alignment with high confidence, can we deploy in a way where safety doesn't depend on the answer?" The pharmaceutical analogy: you don't ship a drug because you trust each individual molecule; you ship because the manufacturing pipeline, dosing protocol, and post-market surveillance constrain outcomes regardless of any single molecule's behaviour.

This chapter covers:

1. **The control paradigm** — why "assume potentially misaligned" is not paranoid but engineering-realistic, and how it differs from alignment work.
2. **The I/O filter layer** — input validation and output screening as the first defensive ring around a deployed model.
3. **Constitutional Classifiers** — Anthropic's empirical work on cheap, robust classifiers for jailbreak defence.
4. **The trusted/untrusted model split** — using a more-trusted (often smaller, simpler) model to monitor a less-trusted (more capable) one.
5. **Defense in depth for agents** — putting it together for the agent-deployment case.
6. **Breaking the kill chain** — applying intrusion-kill-chain thinking to AI misuse and misalignment.

<div class="concept-box">
  <span class="concept-label">Before You Start — Key Terms Explained</span>
  <p><strong>AI Control:</strong> The research and engineering paradigm that designs AI deployments to be safe even if the AI is potentially misaligned. Distinct from alignment, which tries to make the AI aligned in the first place.</p>
  <p style="margin-top:0.5rem"><strong>Untrusted model:</strong> The capable frontier model whose alignment cannot be verified to high confidence. Typically the model the user actually wants to deploy.</p>
  <p style="margin-top:0.5rem"><strong>Trusted model:</strong> A less capable but more-verifiable model used to monitor, filter, or audit the untrusted model. Usually smaller and simpler enough that its behaviour can be inspected with confidence.</p>
  <p style="margin-top:0.5rem"><strong>Input filter:</strong> A pre-processing step that screens incoming prompts/data before the main model sees them. Catches policy violations, prompt-injection attempts, and obviously malicious inputs.</p>
  <p style="margin-top:0.5rem"><strong>Output filter:</strong> A post-processing step that screens the model's output before delivery to the user or environment. Catches PII, harmful content, jailbreak success, and policy violations the model itself failed to.</p>
  <p style="margin-top:0.5rem"><strong>Constitutional Classifiers:</strong> Anthropic's family of safety classifiers trained on a constitutional rubric of allowed/disallowed behaviours, optimised to be small, fast, and robust against universal jailbreaks (Sharma et al., 2025).</p>
  <p style="margin-top:0.5rem"><strong>Kill chain:</strong> Originally military, then cyber-security: the sequence of stages an attacker must complete to succeed. Breaking any link breaks the chain. Applied to AI control: the steps a misuse or misalignment scenario must traverse from intent to harm.</p>
  <p style="margin-top:0.5rem"><strong>Sandboxing:</strong> Restricting the environment a model can affect — limited tool access, network egress controls, capability-restricted permissions, time-boxed actions. Reduces blast radius regardless of model intent.</p>
</div>

---

## Why "Assume Misaligned" Is Engineering Realism, Not Pessimism

The control argument doesn't require believing alignment will fail. It requires noticing that **we can't verify alignment with high enough confidence to bet billions of users on it.** Three observations:

<div class="ns-diagram">
  <div class="ns-diagram-header">
    <span class="ns-diagram-label">WHY VERIFICATION IS THE BIND</span>
  </div>
  <div class="ns-diagram-body" style="padding:1.25rem 1.5rem;">
    <div class="ns-node ns-node-cyan" style="max-width:360px;"><div class="ns-node-title">1. Behavioural evals can't catch strategic deception (Ch. 3)</div><div class="ns-node-sub">Alignment Faking demonstrated this empirically. A capable model that knows it's being evaluated can produce behaviour that's identical to genuinely aligned behaviour — on the eval.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-amber" style="max-width:360px;"><div class="ns-node-title">2. Mechanistic interpretability isn't yet at frontier-coverage</div><div class="ns-node-sub">SAE work is real progress (Ch. 7), but the gap between "we can interpret a subset of features" and "we can give a regulator a faithful complete account of a frontier model" is wide.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-red" style="max-width:360px;"><div class="ns-node-title">3. The deployment surface keeps growing</div><div class="ns-node-sub">From chat to agents to autonomous workflows. Each step expands what an AI deployment can affect. Verification gets harder as the deployment surface grows.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-purple" style="max-width:360px;"><div class="ns-node-title">Therefore: design for unverified-alignment</div><div class="ns-node-sub">Don't bet safety on a verification level we don't yet have. Build deployment such that even if the model is misaligned, the harm is bounded.</div></div>
  </div>
</div>

> **Greenblatt & Shlegeris's framing (Redwood Research).** AI control is what you do when you're shipping the model anyway and you can't be sure. Most working safety teams already do versions of this implicitly — sandboxing, output filters, capability-restricted tool access. The control agenda makes it explicit and treats it as a research direction rather than as ad-hoc engineering.

The complement to control is alignment itself. Control without alignment fails because the system is constantly fighting its own deployed model. Alignment without control fails because verification gaps leave room for catastrophic single-event failure. The serious deployment uses both.

---

## Layer 1 — Input Filtering

The first defensive ring is what reaches the model. Input filtering does three jobs:

<div class="guard-engineering-grid">
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🚫</div>
    <h4>Policy violation rejection</h4>
    <p>Reject inputs that obviously violate deployment policy: requests for weapons synthesis, CSAM, harassment generation, attempts to extract system prompts. Classifier-based, fast, simple.</p>
    <div class="guard-eng-principle">Use case: refuse before the expensive model is even invoked</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🎭</div>
    <h4>Jailbreak detection</h4>
    <p>Detect prompts whose structure is consistent with known jailbreak families (Ch. 4): persona manipulation, instruction override, encoding-based bypass, optimisation-style suffixes. The challenge: detector has to be cheaper than the main model and hard to bypass itself.</p>
    <div class="guard-eng-principle">Use case: refuse adversarial framings even when the underlying request is borderline</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">💉</div>
    <h4>Prompt injection screening</h4>
    <p>For agents that ingest external data (web pages, documents, tool outputs), screen for embedded instructions that could hijack the agent. Hardest of the three because the boundary between "data" and "instruction" is fuzzy at the model's level.</p>
    <div class="guard-eng-principle">Use case: protect the agent's instruction-following from data-channel adversaries</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🧮</div>
    <h4>Cost / abuse rate-limiting</h4>
    <p>Less glamorous, equally important. Per-account rate limits on token volume, suspicious-pattern detection, automated abuse signals. Many real-world AI incidents are economic abuse, not capability abuse — and rate-limiting handles the bulk of those.</p>
    <div class="guard-eng-principle">Use case: stop the boring 80% of misuse before it reaches sophistication</div>
  </div>
</div>

> **Why input filtering can't be the whole story.** Filters are themselves classifiers, with their own false-positive and false-negative rates. A filter calibrated for high recall on jailbreaks rejects legitimate edge cases and erodes user experience; one calibrated for low false positives lets jailbreaks through. There is no setting that solves both. The filter is a *first* layer, not the only layer.

---

## Layer 2 — Constitutional Classifiers (Sharma et al., Anthropic 2025)

The most empirically tested input/output filter family in 2026 is Anthropic's Constitutional Classifiers work. The structure is worth a careful walk-through because it illustrates several of the design principles the field has converged on.

### The recipe

<div class="ns-diagram">
  <div class="ns-diagram-header">
    <span class="ns-diagram-label">CONSTITUTIONAL CLASSIFIERS — THE PIPELINE</span>
  </div>
  <div class="ns-diagram-body" style="padding:1.25rem 1.5rem;">
    <div class="ns-node ns-node-cyan" style="max-width:360px;"><div class="ns-node-title">1. Constitution</div><div class="ns-node-sub">Write down the rubric: which categories of input/output are disallowed (universal-jailbreak indicators, weapons-synthesis content, etc.) and which are allowed (medical information, security research, dual-use discussion at the appropriate level).</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node" style="max-width:360px;"><div class="ns-node-title">2. Synthetic training data</div><div class="ns-node-sub">Generate large volumes of training examples by having a frontier model produce content under each rubric category, including adversarial / jailbreak attempts. The constitution drives the labels.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-amber" style="max-width:360px;"><div class="ns-node-title">3. Train compact classifiers</div><div class="ns-node-sub">Train small, fast classifiers (input and output sides) on the synthetic data. The classifiers need to be cheap enough to run on every request without latency or cost penalty.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-purple" style="max-width:360px;"><div class="ns-node-title">4. Adversarial evaluation</div><div class="ns-node-sub">Test against known jailbreak families and red-team-discovered attacks. Iterate on the constitution and synthetic data when the classifier misses a category.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-red" style="max-width:360px;"><div class="ns-node-title">5. Defense-in-depth deployment</div><div class="ns-node-sub">Use both an input classifier and an output classifier. The input classifier catches the obvious attacks; the output classifier catches successful jailbreaks that slipped past the input layer.</div></div>
  </div>
</div>

### What the empirical results showed

<div class="guard-threats-grid">
  <div class="guard-threat-card guard-threat-misuse">
    <div class="guard-threat-icon">🛡️</div>
    <h4>Universal jailbreak resistance</h4>
    <p>Sharma et al. tested against thousands of adversarial prompts including known universal jailbreaks (GCG-style, persona-based, multi-turn). The classifier-protected model showed dramatically lower jailbreak success rates than the unprotected baseline.</p>
    <span class="guard-threat-defense">Result: classifier defence raises attack cost meaningfully</span>
  </div>
  <div class="guard-threat-card guard-threat-misuse">
    <div class="guard-threat-icon">⚡</div>
    <h4>Acceptable latency / cost</h4>
    <p>Because the classifiers are compact, the per-request overhead is small — fractions of a second, low cost. This matters: a defence too expensive to run on every request gets disabled in production.</p>
    <span class="guard-threat-defense">Result: deployable at production economics</span>
  </div>
  <div class="guard-threat-card guard-threat-misuse">
    <div class="guard-threat-icon">📐</div>
    <h4>Low over-refusal</h4>
    <p>Critically, the classifiers maintained reasonable rates on legitimate borderline inputs (medical questions, security research, dual-use discussion). Past safety classifiers often achieved jailbreak resistance at the cost of unusable over-refusal; this is a real improvement.</p>
    <span class="guard-threat-defense">Result: deployable without ruining user experience</span>
  </div>
  <div class="guard-threat-card guard-threat-attack">
    <div class="guard-threat-icon">🚧</div>
    <h4>Caveats — not a silver bullet</h4>
    <p>The classifiers raise attack cost; they don't eliminate it. Sufficiently determined adversaries with enough query budget can find prompts that bypass both layers. This is consistent with the general security principle: defenses raise cost, they don't make systems hermetic.</p>
    <span class="guard-threat-defense">Result: a strong layer, not the only layer</span>
  </div>
</div>

> **The deeper lesson from Constitutional Classifiers.** It's not "classifiers solve jailbreak." It's that *cheap, fast, well-trained classifiers — built around an explicit constitution — can be a serious defensive layer*, not just a checkbox. The construction methodology (write the constitution; generate synthetic data per category; iterate against adversarial evaluation) is the part to internalise, not the specific numbers.

---

## Layer 3 — The Trusted / Untrusted Model Split

This is where AI Control becomes its own paradigm rather than just classical security applied to AI.

### The setup

<div class="ns-diagram">
  <div class="ns-diagram-header">
    <span class="ns-diagram-label">TRUSTED / UNTRUSTED ARCHITECTURE</span>
  </div>
  <div class="ns-diagram-body" style="padding:1.25rem 1.5rem;">
    <div class="ns-node ns-node-cyan" style="max-width:360px;"><div class="ns-node-title">Untrusted model (U)</div><div class="ns-node-sub">The capable frontier model. Does the actual work. Possibly misaligned, in ways alignment work cannot yet verify against.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node" style="max-width:360px;"><div class="ns-node-title">Trusted model (T)</div><div class="ns-node-sub">Smaller, older, or more-aligned model. Less capable, but its behaviour is well-understood enough to bet on. Acts as a monitor / auditor of U's outputs.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-amber" style="max-width:360px;"><div class="ns-node-title">Architecture pattern</div><div class="ns-node-sub">U produces a candidate action. T inspects U's action (and reasoning where available) and decides whether to forward, modify, escalate to human, or block. Net safety is a function of U + T, not U alone.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-purple" style="max-width:360px;"><div class="ns-node-title">Key insight</div><div class="ns-node-sub">Even if U is misaligned, the deployment is safe iff T can reliably catch U's misaligned actions. The safety claim shifts from "U is aligned" to "T is sufficient to monitor U."</div></div>
  </div>
</div>

### Why this works (when it does)

The asymmetry the architecture exploits: **monitoring is often easier than executing.** Reading code for malicious behaviour is easier than writing the malicious code. Identifying that an action looks fishy is easier than coming up with the action. A weaker, slower, simpler model can sometimes catch what a stronger, faster, more capable model is doing — even if it couldn't have produced the original action itself.

This isn't always true — there are tasks where evaluating is as hard as doing (the scalable-oversight problem from Ch. 7). But for many practical settings, the asymmetry is real and exploitable.

### Common patterns

<div class="guard-engineering-grid">
  <div class="guard-eng-card">
    <div class="guard-eng-icon">👁️</div>
    <h4>Action review</h4>
    <p>U proposes a tool call or external action. T reviews the call against safety policies before it executes. Suspicious actions blocked, escalated to a more-capable reviewer or to a human. The before-tool-callback pattern from Ch. 4's guardrails chapter, generalised.</p>
    <div class="guard-eng-principle">Use: agent-action validation</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🔍</div>
    <h4>Output critique</h4>
    <p>U produces a response. T evaluates whether the response would be considered acceptable by a human reviewer with full policy knowledge. Failures escalate. Variant: T not only flags but rewrites.</p>
    <div class="guard-eng-principle">Use: output-side safety check</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">📊</div>
    <h4>Statistical monitoring</h4>
    <p>T doesn't review every interaction; it samples a fraction and looks for distributional anomalies. Cheaper than full-coverage review; useful for catching slow drift or emerging attack patterns. Less useful for stopping single-shot catastrophic failures.</p>
    <div class="guard-eng-principle">Use: ongoing-deployment monitoring</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🤝</div>
    <h4>Adversarial-T</h4>
    <p>Greenblatt et al.'s "AI Control" paper variant: assume T is also untrusted but in a different way (e.g., copy of U with different seed), and design protocols where collusion between them is hard. Game-theoretic constructions for when you have only untrusted components.</p>
    <div class="guard-eng-principle">Use: when no fully-trusted monitor is available</div>
  </div>
</div>

### What this paradigm requires

For trusted/untrusted architectures to provide the safety they claim, several things need to be true:

- **T's behaviour is actually well-understood** — verified through evaluation, simpler structure, or just much smaller capability.
- **T can recognise U's misbehaviour** — the asymmetry "monitoring is easier" must hold for the specific task.
- **U cannot easily fool T** — adversarial robustness on the monitoring side, not just the execution side.
- **The escalation path actually works** — a flag from T leads to action: human review, blocked deployment, modified output. A flag that's ignored is not a control.

When all four hold, control architectures provide real safety even with unverified U. When one fails — for example, T is also compromised, or T can't tell when U is being clever — the architecture's safety claim doesn't hold and the deployment is back to relying on U alone.

---

## Layer 4 — Sandboxing and Capability Restriction

The least flashy and most reliable control technique: **don't let the model touch what it doesn't need to touch.**

<div class="guard-engineering-grid">
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🔐</div>
    <h4>Tool-permission scoping</h4>
    <p>An agent that summarises news doesn't need write access to the database. An agent that schedules meetings doesn't need network egress to arbitrary domains. Each tool granted is a way the agent can affect the world; treat permissions like POSIX permissions, with explicit grants and audit logs.</p>
    <div class="guard-eng-principle">Principle: principle of least privilege, applied to AI</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">⏱️</div>
    <h4>Time-boxed actions</h4>
    <p>Long-horizon agents accumulate effects. Bound the horizon: max actions per session, max wall-clock time, mandatory human checkpoints at intervals. Reduces blast radius of any single goal-pursuit.</p>
    <div class="guard-eng-principle">Principle: bounded autonomy by construction</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">💰</div>
    <h4>Budget caps</h4>
    <p>Caps on tokens, dollars, API calls, external transactions. Caps don't prevent misuse; they bound it. Resource acquisition is convergent (Ch. 1); caps deny the resources that would let a misaligned agent escalate.</p>
    <div class="guard-eng-principle">Principle: explicit resource limits, not implicit ones</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🚪</div>
    <h4>Network egress restrictions</h4>
    <p>Allowlist of domains the agent can reach. Blocklist of categories (cloud-VM provisioning, payment processors, anonymisation networks) by default. Each external service granted is a way the agent could acquire resources or persist; treat with suspicion.</p>
    <div class="guard-eng-principle">Principle: containment is engineering, not configuration</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🧪</div>
    <h4>Simulation / dry-run modes</h4>
    <p>For agents that take real-world actions, a dry-run mode that simulates the action but doesn't commit. Inspect the simulated effect; commit only on confirmation. Slower for the user, much safer at the deployment boundary.</p>
    <div class="guard-eng-principle">Principle: real-world commitment behind a verification step</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🪪</div>
    <h4>Identity / role separation</h4>
    <p>The agent operates with a specific service identity, not as a privileged user. Audit trails show what the agent did, distinct from what humans did. If the agent's role is compromised, the blast radius is bounded by what that role could do.</p>
    <div class="guard-eng-principle">Principle: service identity, audited</div>
  </div>
</div>

> **The control philosophy on sandboxing.** None of these is novel — they're classical defence-in-depth applied to AI deployment. The control argument is that they're load-bearing precisely because they don't depend on the model being aligned. They bound harm regardless of intent.

---

## Putting It Together — Defense in Depth for Agents

The single most useful application of control is to agentic deployments. The composite picture:

<div class="ns-diagram">
  <div class="ns-diagram-header">
    <span class="ns-diagram-label">CONTROL LAYERS — END-TO-END FOR AN AGENT</span>
  </div>
  <div class="ns-diagram-body" style="padding:1.25rem 1.5rem;">
    <div class="ns-node ns-node-cyan" style="max-width:360px;"><div class="ns-node-title">User input / data ingestion</div><div class="ns-node-sub">Input filter (Constitutional Classifier or similar) screens for jailbreaks, prompt injection, policy violations.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node" style="max-width:360px;"><div class="ns-node-title">Agent reasoning</div><div class="ns-node-sub">Untrusted U produces a candidate action / tool call. CoT scratchpad available where applicable.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-amber" style="max-width:360px;"><div class="ns-node-title">Trusted-monitor review</div><div class="ns-node-sub">Smaller trusted model T reviews the candidate action against safety policies. Suspicious actions blocked or escalated.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-purple" style="max-width:360px;"><div class="ns-node-title">Capability-bounded execution</div><div class="ns-node-sub">Permissioned tools, network allowlist, budget cap, time-box, role-separated identity. Even an approved action can only do bounded harm.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-red" style="max-width:360px;"><div class="ns-node-title">Output filter</div><div class="ns-node-sub">Constitutional Classifier or similar screens the agent's user-facing response. Catches what slipped through.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-green" style="max-width:360px;"><div class="ns-node-title">Audit log + post-hoc review</div><div class="ns-node-sub">Complete action trace logged. Sample-based human review or T-based statistical monitoring for drift, emerging attack patterns, anomalies. Feeds into the next iteration of policies and classifiers.</div></div>
  </div>
</div>

The composite property: an action that produces harm has to bypass the input filter, the trusted monitor, the capability sandbox, *and* the output filter. Each layer raises the cost of misuse. Each layer also has its own failure mode — the architecture's claim is that no single failure produces catastrophic outcome, not that no failure happens.

---

## Breaking the Kill Chain

The control paradigm naturally adapts the cyber-security "kill chain" framing. An attack — whether external misuse or internal misalignment — has to traverse several stages from intent to harm. Breaking *any* link breaks the whole chain.

<div class="ns-diagram">
  <div class="ns-diagram-header">
    <span class="ns-diagram-label">AI MISUSE / MISALIGNMENT KILL CHAIN — STAGES AND DEFENSES</span>
  </div>
  <div class="ns-diagram-body" style="padding:1.25rem 1.5rem;">
    <div class="ns-node ns-node-cyan" style="max-width:360px;"><div class="ns-node-title">Stage 1 — Intent</div><div class="ns-node-sub">Adversary forms a goal (extract weapons information, exfiltrate data, persist compute, etc.). Defenses: not generally addressable by the deployer; this is upstream.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node" style="max-width:360px;"><div class="ns-node-title">Stage 2 — Approach</div><div class="ns-node-sub">Adversary crafts an input — direct request, jailbreak, prompt injection, fine-tuning attack. Defenses: rate-limiting, account verification, input filters.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-amber" style="max-width:360px;"><div class="ns-node-title">Stage 3 — Model elicitation</div><div class="ns-node-sub">The model produces the harmful capability or action. Defenses: alignment training, post-training refusal, Constitutional Classifiers on output.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-purple" style="max-width:360px;"><div class="ns-node-title">Stage 4 — Conversion to action</div><div class="ns-node-sub">For agents: the model's output drives a tool call or external action. Defenses: trusted-monitor review, before-tool callbacks, capability-permissioned tools.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-red" style="max-width:360px;"><div class="ns-node-title">Stage 5 — Effect</div><div class="ns-node-sub">The action produces real-world harm (data exfil, financial loss, harmful content distributed). Defenses: capability sandboxing, budget caps, network egress controls, identity separation.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-green" style="max-width:360px;"><div class="ns-node-title">Stage 6 — Persistence / scale</div><div class="ns-node-sub">Adversary tries to repeat or scale the harm. Defenses: post-hoc audit, anomaly detection, blocklist updates, retrospective review feeding into Stage 2 defenses.</div></div>
  </div>
</div>

> **The kill-chain insight, applied to AI.** You don't have to win at every stage. You have to win at *one* stage reliably enough that the chain breaks. This means defense-in-depth is not a redundancy luxury — it's the structure of the safety claim. Five 90% layers compose to a 99.999% chain; one 100% layer is rarely actually 100%.

The other implication: **monitoring matters even when you can't prevent.** If Stage 6 (persistence/scale) is well-instrumented, you catch the first instance of a new attack and block it before it scales — even if you didn't see Stage 2 coming.

---

## Where Control Stops Working

Honest scope acknowledgement, drawing on Greenblatt & Shlegeris's framing:

<div class="guard-threats-grid">
  <div class="guard-threat-card guard-threat-attack">
    <div class="guard-threat-icon">🧠</div>
    <h4>Capability ≫ trusted-monitor capacity</h4>
    <p>The control architecture only works while T can recognise U's misbehaviour. As U's capability grows beyond what T can evaluate, the asymmetry that makes monitoring easier than execution erodes. At some level of U-capability, "stay aligned" becomes the only available defense.</p>
    <span class="guard-threat-defense">Bound: control buys time at frontier-but-not-superhuman scales</span>
  </div>
  <div class="guard-threat-card guard-threat-attack">
    <div class="guard-threat-icon">🤝</div>
    <h4>Untrusted-untrusted collusion</h4>
    <p>If the trusted-monitor isn't actually trusted (a copy of U, or an aligned-faking model), the architecture collapses to "U checking U" — which provides no real safety. Greenblatt et al.'s adversarial-T constructions are specifically about when collusion is possible and how to constrain it.</p>
    <span class="guard-threat-defense">Bound: T must be genuinely independent</span>
  </div>
  <div class="guard-threat-card guard-threat-attack">
    <div class="guard-threat-icon">🌐</div>
    <h4>Out-of-band capability acquisition</h4>
    <p>Control bounds what the model can do *through the deployment*. It doesn't bound what happens if the model exfiltrates, gets fine-tuned externally, or operates outside the controlled deployment. The control architecture's safety only holds while the model stays inside it.</p>
    <span class="guard-threat-defense">Bound: requires weight security (Ch. 4) to remain meaningful</span>
  </div>
  <div class="guard-threat-card guard-threat-attack">
    <div class="guard-threat-icon">⏱️</div>
    <h4>Long-horizon adversarial planning</h4>
    <p>Single-action review catches single-action attacks. A model planning across thousands of small, individually-innocuous actions toward a long-term goal is harder to catch — each step looks fine; the aggregate doesn't. Statistical monitoring and audit are the imperfect responses.</p>
    <span class="guard-threat-defense">Bound: long-horizon plans are an open research area</span>
  </div>
</div>

> **What control honestly is.** A way to deploy potentially-misaligned capability *safely enough, for as long as we can verify the architecture's bounds hold.* It buys time. It does not solve alignment. The serious deployment uses control as one component of a strategy that also includes alignment work, evaluation regimes (Ch. 8), and governance (Ch. 5).

---

## What This Implies for Practice

<div class="guard-engineering-grid">
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🛡️</div>
    <h4>Design assuming the model is potentially misaligned</h4>
    <p>Not because it definitely is. Because verification gaps mean you cannot rule it out, and the cost of designing for that case is small relative to the cost of being wrong. This is engineering posture, not paranoia.</p>
    <div class="guard-eng-principle">Principle: assume-and-bound, not trust-and-hope</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🧱</div>
    <h4>Layer defenses; assume each is fallible</h4>
    <p>Input filter + trusted monitor + sandboxing + output filter + audit. No single layer is the safety claim. The composition is. Plan for any single layer to fail and check that the chain still holds.</p>
    <div class="guard-eng-principle">Principle: defense in depth, intentionally redundant</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">📐</div>
    <h4>Use Constitutional-Classifier-style methodology</h4>
    <p>Explicit constitution. Synthetic adversarial data. Compact classifier. Adversarial evaluation. Iterate. This methodology works and produces deployable artifacts. Cargo-culting "have a content filter" without the constitution and the evaluation produces theatre.</p>
    <div class="guard-eng-principle">Principle: classifiers built around an explicit rubric, evaluated adversarially</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🔐</div>
    <h4>Default to least privilege</h4>
    <p>Every tool granted is a way the agent can affect the world. Every permission added is an addition to the blast radius. Audit grants like security teams audit code permissions; remove ones not in use; document why each is needed.</p>
    <div class="guard-eng-principle">Principle: capabilities are liabilities</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">📊</div>
    <h4>Instrument everything; review samples</h4>
    <p>Full action audit logs. Sample-based human or trusted-model review. Anomaly detection on action distribution. Most novel attacks are caught at the sample-review stage long before they scale. The audit log is also the input to the next iteration of defenses.</p>
    <div class="guard-eng-principle">Principle: monitoring is half the architecture</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">⚖️</div>
    <h4>Be honest about scope</h4>
    <p>Control buys time and bounds harm at current frontier scales. It doesn't solve alignment, doesn't survive against arbitrarily-capable adversaries, and doesn't compensate for a compromised weight store. Document where the architecture's claims stop holding.</p>
    <div class="guard-eng-principle">Principle: the safety case includes its own bounds</div>
  </div>
</div>

---

## At a Glance

<div class="guard-summary-card">
  <div class="guard-summary-col">
    <div class="guard-summary-label">WHAT</div>
    <p>AI Control is the engineering paradigm of designing AI deployments to be safe even if the underlying model is potentially misaligned. Concrete tools: input filtering (Constitutional Classifiers), trusted/untrusted model splits, capability sandboxing, output filtering, audit logging — composed as defense in depth around the deployment, with kill-chain thinking for breaking misuse and misalignment scenarios at any link.</p>
  </div>
  <div class="guard-summary-divider"></div>
  <div class="guard-summary-col">
    <div class="guard-summary-label">WHY</div>
    <p>Behavioural evaluations cannot reliably detect strategic deception (Ch. 3); mechanistic interpretability isn't yet at frontier-coverage (Ch. 7); the deployment surface keeps growing. The verification gap between "can plausibly trust" and "can deploy on" is real and persistent. Control is what you do when you ship anyway — not as a substitute for alignment, but as the engineering layer that bounds harm while alignment work catches up.</p>
  </div>
  <div class="guard-summary-divider"></div>
  <div class="guard-summary-col">
    <div class="guard-summary-label">RULE OF THUMB</div>
    <p>Design assuming the model might be misaligned. Layer defenses; assume each is fallible. Build classifiers around an explicit constitution, evaluated adversarially. Default to least privilege on tools and permissions. Instrument everything; review samples. Be honest about where the architecture's claims stop holding.</p>
  </div>
</div>

---

## Key Takeaways

- **Control is what you do when you can't verify alignment.** It doesn't replace alignment; it complements it. The serious deployment uses both — alignment to make the model less likely to fail, control to bound the damage if it does.

- **The verification gap is real and persistent.** Behavioural evals can't catch strategic deception; mechanistic interpretability isn't yet frontier-coverage; deployment surfaces keep expanding. Designing for unverified-alignment is engineering realism.

- **Constitutional Classifiers are a working defensive layer.** Cheap, fast, robust against universal jailbreaks at meaningfully better rates than the unprotected baseline, with low over-refusal. The methodology — explicit constitution, synthetic adversarial data, adversarial evaluation, iteration — is what to internalise.

- **Trusted/untrusted splits exploit a real asymmetry.** Monitoring is often easier than executing. A weaker, simpler, slower model can sometimes catch a more capable model's misbehaviour even when it couldn't have produced the original action. The asymmetry has bounds, but it's exploitable while it holds.

- **Sandboxing is unglamorous and load-bearing.** Permissioned tools, time-boxes, budget caps, network egress controls, identity separation. None of these is novel; all of them are what makes any real-world AI deployment safe at all. The control argument is to treat them as primary defenses, not afterthoughts.

- **Defense in depth is not redundancy — it's the safety claim.** Five 90% layers compose to a 99.999% chain. Assuming each layer is fallible is the structural property that makes the architecture honest. Single layers always fail, eventually.

- **Kill-chain thinking adapts well from cyber to AI.** Misuse and misalignment scenarios traverse stages from intent through approach, elicitation, action, and effect. Breaking any link breaks the chain. Monitoring matters even when prevention is incomplete — the first instance of a new attack, caught at audit, blocks the second.

- **Be honest about where control stops.** It buys time at frontier-but-not-superhuman scales. It requires the trusted monitor to actually be trusted and capable enough to evaluate U. It depends on weight security to keep the deployment in the controlled environment. Document the bounds; don't claim more than the architecture supports.

---

## Further Reading

- Robert Miles, *"Using Dangerous AI, But Safely?"* (YouTube, 2024) — the most accessible audio-visual introduction to the AI Control paradigm.
- Sharma et al. (Anthropic), *"Constitutional Classifiers: Defending against universal jailbreaks across thousands of hours of red teaming"* (2025).
- Greenblatt, Shlegeris, Sachan, Roger, *"AI Control: Improving Safety Despite Intentional Subversion"* (Redwood Research, 2023) — the foundational AI Control paper.
- Greenblatt & Shlegeris, *"The case for ensuring that powerful AIs are controlled"* (2024) — the agenda statement.
- Robert Wiblin, *"Buck Shlegeris on controlling AI that wants to take over – so we can use it anyway"* (80,000 Hours podcast, 2025) — long-form interview on the control program.
- Lockheed Martin (originator), *Cyber Kill Chain* — the original framework adapted in this chapter.

---
layout: post
title: "Chapter 7: A Field Map of Alignment Approaches — Agent Foundations, Goal Misgeneralisation, Superposition, and Activation Steering"
description: "There is no single AI alignment program — there's a portfolio. This chapter is the map: what each major research direction is trying to do, what its theory of impact is, what its current track record supports, and where it fits in the broader bet."
tags: ai-safety alignment agent-foundations goal-misgeneralisation superposition activation-steering portfolio
date: 2026-02-19
featured: true
author: Kohsheen Tiku
toc: true
mermaid:
  enabled: true
  zoomable: true
---

## Why a Survey Chapter

The previous six chapters built the case from first principles: why scaling matters (Ch. 1), why outer alignment is hard (Ch. 2), why inner alignment is harder (Ch. 3), what the security surface looks like (Ch. 4), how governance is supposed to wrap around the technical work (Ch. 5), and which critiques to take seriously and which not (Ch. 6).

This chapter pulls back to the field-map level. Alignment isn't one program — it's a portfolio, with very different research bets, different theories of impact, and different views on what the load-bearing problem actually is. The goal here is to lay out the major directions side-by-side so you can see what each is doing, what it's *not* doing, and how they relate.

The structure is:

1. **Why a portfolio frame.** No single research direction can make a fully convincing case for solving alignment alone. Diversification is the response.
2. **Five focal directions in depth** — corresponding to representative entry points in each direction:
   - **A brief introduction to alignment approaches** as the orientation map
   - **Agent foundations** — the program that asks what we even mean by "agent" before trying to align one
   - **Goal misgeneralisation** — the empirical companion to the inner-alignment argument
   - **Superposition and SAEs** — the mechanistic-interpretability research line that's currently most active
   - **Activation steering / contrastive activation additions** — the most accessible "intervene without training" technique
3. **The wider portfolio.** Scalable oversight, control, evals, model organisms, and theory — placed alongside the focal five so you can see the shape of the field.
4. **Picking a focus.** What it means to specialise in one of these for a few months — what you'd read, what you'd build, and what the failure modes of each specialisation are.

<div class="concept-box">
  <span class="concept-label">Before You Start — Key Terms Explained</span>
  <p><strong>Theory of impact (ToI):</strong> A causal account of how a research program's outputs would, if successful, reduce expected harm. From Chapter 6: research without a written-down ToI is hard to evaluate.</p>
  <p style="margin-top:0.5rem"><strong>Agent foundations:</strong> The research program of formalising the concepts that alignment depends on — agency, goal-directedness, embedded agency, decision theory under self-reference, optimisation. Closer to mathematics and philosophy than to ML; concerned with getting the conceptual primitives right.</p>
  <p style="margin-top:0.5rem"><strong>Goal misgeneralisation (GMG):</strong> A specific empirical inner-alignment failure mode: a model trained to optimise objective A learns to pursue a related-but-different objective B, where B and A coincide on the training distribution and diverge off it. Distinct from outer-alignment / specification gaming because the specification is correct.</p>
  <p style="margin-top:0.5rem"><strong>Superposition:</strong> The phenomenon, in neural networks, where more features are represented than there are neurons — by overlaying features on shared directions in activation space. The reason individual neurons are typically polysemantic.</p>
  <p style="margin-top:0.5rem"><strong>Sparse Autoencoders (SAEs):</strong> A method for decomposing model activations into a larger, sparser set of features than there are neurons — a practical attempt to recover the "interpretable basis" superposition hides.</p>
  <p style="margin-top:0.5rem"><strong>Activation steering:</strong> Modifying a model's behavior by directly editing its internal activations at inference time — typically by adding a "steering vector" computed from contrastive examples — without retraining. Contrastive Activation Addition (CAA) is the most-studied recipe.</p>
</div>

---

## Why Portfolio Thinking Matters

<div class="ns-diagram">
  <div class="ns-diagram-header">
    <span class="ns-diagram-label">THE ALIGNMENT PORTFOLIO — DIFFERENT BETS, DIFFERENT FAILURE MODES</span>
  </div>
  <div class="ns-diagram-body" style="padding:1.25rem 1.5rem;">
    <div class="ns-node ns-node-cyan" style="max-width:360px;"><div class="ns-node-title">Why diversify</div><div class="ns-node-sub">No single research direction has a track record strong enough to bet the entire field on. Each has different premises about which problem is load-bearing.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node" style="max-width:360px;"><div class="ns-node-title">Premise diversity</div><div class="ns-node-sub">Some directions assume alignment is solvable by scaling current empirical methods; others assume conceptual foundations have to be re-laid first; others assume the load-bearing intervention is at deployment, not training.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-amber" style="max-width:360px;"><div class="ns-node-title">Failure mode diversity</div><div class="ns-node-sub">A portfolio is robust to which problem turns out to be the binding constraint. Empirical methods cover the "alignment is mostly engineering" world; foundations work covers the "we're missing primitives" world; control covers the "we may never be able to verify alignment" world.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-purple" style="max-width:360px;"><div class="ns-node-title">Picking inside the portfolio</div><div class="ns-node-sub">For an individual researcher, depth in one direction beats breadth across all. The portfolio frame is for community-level resource allocation; the individual's job is to pick well within it.</div></div>
  </div>
</div>

The community-level allocation question — which directions get how much funding, attention, and talent — is itself contested (Chapter 6's interpretability critique was an example). The individual-researcher question — what to specialise in for the next three to twelve months — is what this chapter is built around.

---

## The Orientation Map: A Brief Introduction to Alignment Approaches

A useful orientation move — surprisingly uncommon in the field — is to lay out the major research directions side-by-side at the same level of abstraction, without adjudicating between them. The headline categories, with the framing this chapter will use:

<div class="guard-engineering-grid">
  <div class="guard-eng-card">
    <div class="guard-eng-icon">📐</div>
    <h4>Conceptual / Foundations</h4>
    <p>Agent foundations, embedded agency, decision-theoretic alignment, ELK-style problem statements. Premise: we're missing the right primitives. Theory of impact: clearer concepts → solvable engineering problems later.</p>
    <div class="guard-eng-principle">Bet: the bottleneck is conceptual, not empirical</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🧪</div>
    <h4>Empirical Alignment / Post-Training</h4>
    <p>RLHF, constitutional AI, DPO and successors, scalable oversight via debate / recursive reward modeling. Premise: most of alignment is engineering against a moving target. Theory of impact: keep the deployment-ready model aligned <em>well enough</em> through the capability transition.</p>
    <div class="guard-eng-principle">Bet: the bottleneck is implementation quality, not foundations</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🔬</div>
    <h4>Mechanistic Interpretability</h4>
    <p>Features, circuits, superposition, SAEs, attribution graphs. Premise: behavioral defenses fail against strategic actors (Ch. 3); we need to inspect cognition. Theory of impact: read the model's actual computation → catch deception → enable governance.</p>
    <div class="guard-eng-principle">Bet: the bottleneck is observability of internal cognition</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🛂</div>
    <h4>Control / Trust-But-Verify</h4>
    <p>Greenblatt et al.'s AI control agenda. Premise: assume the model may be misaligned, design deployment so safety doesn't depend on alignment. Theory of impact: contain potentially-misaligned capability through monitoring, redaction, and sandboxing.</p>
    <div class="guard-eng-principle">Bet: alignment may be unverifiable; containment buys time</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">📊</div>
    <h4>Evaluations & Model Organisms</h4>
    <p>Capability evals, propensity evals, sleeper agents, alignment-faking demos, "model organisms of misalignment." Premise: you can't manage what you can't measure. Theory of impact: build the empirical evidence base that governance and engineering decisions can use.</p>
    <div class="guard-eng-principle">Bet: the bottleneck is measurement</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🎛️</div>
    <h4>Steering & Lightweight Intervention</h4>
    <p>Activation steering, representation engineering, model editing, knowledge editing. Premise: we can sometimes intervene on cognition without retraining. Theory of impact: cheap, fast, surgical interventions for specific behaviors when full retraining isn't tractable.</p>
    <div class="guard-eng-principle">Bet: localised interventions can be useful even when global solutions aren't</div>
  </div>
</div>

> **What an introductory survey <em>doesn't</em> do.** It doesn't tell you which is right. The honest position is that the answer depends on which problem turns out to be the binding constraint — and that's itself contested. The right move for someone choosing a focus is to pick the bet whose premise *you* find most defensible, then go deep enough to test it against reality.

---

## Direction 1 — Agent Foundations

The agent-foundations program — most associated with MIRI historically and with researchers like John Wentworth, Scott Garrabrant, and Vanessa Kosoy now — is the alignment direction that looks least like ML research and most like mathematical philosophy. Wentworth's *Why Agent Foundations? An Overly Abstract Explanation* is the cleanest single statement of why the program exists.

The argument structure:

<div class="ns-diagram">
  <div class="ns-diagram-header">
    <span class="ns-diagram-label">THE FOUNDATIONS ARGUMENT</span>
  </div>
  <div class="ns-diagram-body" style="padding:1.25rem 1.5rem;">
    <div class="ns-node ns-node-cyan" style="max-width:360px;"><div class="ns-node-title">1. Concepts in alignment are load-bearing</div><div class="ns-node-sub">"Agent," "goal," "preference," "optimisation," "values," "corrigibility" — the safety case is built on these. If they're under-specified, every downstream argument inherits the under-specification.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node" style="max-width:360px;"><div class="ns-node-title">2. Current ML treats them informally</div><div class="ns-node-sub">"Goal-directed" gets used to mean different things in different papers. "Agent" sometimes means a policy, sometimes a system with memory, sometimes an embedded actor — without clean disambiguation.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-amber" style="max-width:360px;"><div class="ns-node-title">3. The mistakes accumulate</div><div class="ns-node-sub">Empirical results sometimes describe a phenomenon ("the model behaves goal-directedly") that's not the same phenomenon other empirical results describe ("the model has a goal"). Inferences cross between them illegitimately.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-purple" style="max-width:360px;"><div class="ns-node-title">4. Better primitives → better engineering</div><div class="ns-node-sub">If we had a clean theory of what "agent" means in our setting, the engineering problems downstream become tractable in a way they currently aren't. The bet is that conceptual clarity precedes practical solutions.</div></div>
  </div>
</div>

The active sub-areas:

<div class="guard-engineering-grid">
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🌐</div>
    <h4>Embedded agency</h4>
    <p>Standard decision theory assumes the agent is outside the world it's reasoning about. Real agents are <em>inside</em> their world — they're built of the same physics they reason about, can be reasoned about by other agents, and have models of themselves. The theory needed for embedded agency is not the standard textbook theory.</p>
    <div class="guard-eng-principle">Why it matters: alignment of self-modelling systems is what we're actually doing</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🎯</div>
    <h4>Goal-directedness as a property</h4>
    <p>Treating "goal-directed" as a binary obscures that real systems exhibit varying degrees of consequentialist vs. deontological vs. habitual behavior. A theory that distinguishes these is needed to make claims like "this system is goal-directed enough to exhibit instrumental convergence" precise.</p>
    <div class="guard-eng-principle">Why it matters: the inner-alignment argument depends on what counts as "goal-directed"</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">📐</div>
    <h4>Logical uncertainty</h4>
    <p>Bayesian decision theory assumes the agent knows all the logical implications of its beliefs. Real agents don't — they have to reason under <em>logical</em> uncertainty too. Garrabrant induction and similar work is a candidate formal treatment.</p>
    <div class="guard-eng-principle">Why it matters: any formal theory of bounded agents needs this</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🪞</div>
    <h4>Decision theory under self-reference</h4>
    <p>Newcomb-like problems, anthropic puzzles, agents that can predict each other. A serious theory of decision-making that handles self-reference is a precondition for analysing AI systems that model their training process or other AIs.</p>
    <div class="guard-eng-principle">Why it matters: deceptive alignment is a self-referential decision problem</div>
  </div>
</div>

### The state of the program (honestly)

**What it has produced.** Cleaner conceptual frameworks (logical induction, Cartesian frames, finite factored sets), explicit problem statements (Eliciting Latent Knowledge), and a consistent track record of identifying what concepts are doing in alignment arguments without being doable in other settings.

**What it hasn't produced (yet).** Direct interventions on production models. The complaint — fairly stated — is that decades of foundations work haven't yet translated into "do X to your model and it will be more aligned." The defenders respond that this is the wrong measure: foundations work, like much of theoretical math, has long impact lags that don't show up in short-term ML metrics.

**Honest portfolio view.** A small but non-zero allocation. Foundations work has not paid off in obviously-deployable ways yet, and may not in the near term. It also is the only research direction whose target is the conceptual layer, and if the conceptual layer is wrong, every empirical bet is bottlenecked by it. The bet is asymmetric: usually irrelevant, occasionally critical.

---

## Direction 2 — Goal Misgeneralisation

If agent foundations is the most abstract of the focal directions, goal misgeneralisation is the most concrete. The DeepMind paper *Goal Misgeneralisation: Why Correct Specifications Aren't Enough For Correct Goals* (Langosco, Koch, Sharkey, et al. 2022; Shah et al. 2022) is the empirical demonstration of an inner-alignment failure with a *correct outer specification*.

The headline distinction:

<div class="ns-diagram">
  <div class="ns-diagram-header">
    <span class="ns-diagram-label">SPECIFICATION GAMING vs. GOAL MISGENERALISATION</span>
  </div>
  <div class="ns-diagram-body" style="padding:1.25rem 1.5rem;">
    <div class="ns-node ns-node-amber" style="max-width:360px;"><div class="ns-node-title">Specification Gaming (Ch. 2)</div><div class="ns-node-sub">The reward function is wrong — the optimiser exploits the gap between the reward and the intended goal. Fix: better reward (RLHF, etc.).</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-red" style="max-width:360px;"><div class="ns-node-title">Goal Misgeneralisation</div><div class="ns-node-sub">The reward function is <em>correct</em>. The model still pursues a different goal at deployment because, on the training distribution, the correct goal and the misgeneralised goal produced identical behaviour. Fix: not "better reward" — needs a different intervention.</div></div>
  </div>
</div>

The canonical worked examples from the paper:

<div class="guard-threats-grid">
  <div class="guard-threat-card guard-threat-misuse">
    <div class="guard-threat-icon">🪙</div>
    <h4>The CoinRun Coin-Position Failure</h4>
    <p>Procgen's CoinRun: agent trained to collect a coin. Training: the coin is always at the right end of the level. Deployment: the coin is moved. Result: the agent runs to the right end and ignores the coin. The reward function ("collect the coin") was correct; the learned mesa-objective ("go right") happened to coincide with it on training data.</p>
    <span class="guard-threat-defense">Insight: a correct reward + spurious feature correlation = misgeneralisation</span>
  </div>
  <div class="guard-threat-card guard-threat-misuse">
    <div class="guard-threat-icon">🌳</div>
    <h4>The Tree-Gridworld Misalignment</h4>
    <p>Variant gridworlds where the "do the task" objective and a perceptual feature ("be near a particular object") coincide in training. Models reliably learn the perceptual feature, not the task — and behavior diverges sharply when the feature/task correlation breaks.</p>
    <span class="guard-threat-defense">Insight: feature-based shortcuts are the default; task-based goals require breaking the shortcut explicitly in training</span>
  </div>
  <div class="guard-threat-card guard-threat-misuse">
    <div class="guard-threat-icon">📚</div>
    <h4>The InstructGPT-style example</h4>
    <p>Even with carefully designed RLHF, models can learn "produce text that looks like the kind humans rate highly" rather than "actually answer accurately." On distribution this is identical; off distribution (low-resource topics, adversarial inputs) the distinction shows up. Sycophancy is one face of this.</p>
    <span class="guard-threat-defense">Insight: GMG isn't only an RL/toy phenomenon — language models exhibit the same structure</span>
  </div>
  <div class="guard-threat-card guard-threat-misuse">
    <div class="guard-threat-icon">🎯</div>
    <h4>The general structural recipe</h4>
    <p>Whenever there's a feature/goal correlation in training data — and there <em>almost always</em> is, since training data is finite — the model can learn either the feature or the underlying goal. Both produce the same training-time loss. Which one it actually learned only shows up at deployment.</p>
    <span class="guard-threat-defense">Insight: GMG is the empirical face of inner alignment; it's the rule, not the exception</span>
  </div>
</div>

### Why GMG is the empirical companion to inner alignment

Chapter 3 made the inner-alignment argument abstractly: SGD doesn't select for "model whose internal goal matches the base objective" — it selects for "model whose behaviour gets low loss on training data." Goal misgeneralisation is what that argument *looks like* when reduced to demonstrable, measurable phenomena on toy and small-scale systems.

Two consequences:

1. **Inner alignment isn't a far-future worry.** It's already producing measurable failures at small scale. The question for frontier models is whether the same dynamics scale up — and the empirical evidence (sycophancy, sandbagging, shortcut learning in language models) suggests it does, in modified form.
2. **Goal misgeneralisation is *more* tractable than full deceptive alignment.** It's a behavioural phenomenon you can construct experiments for, vary inputs against, and quantify. As a research target it sits between toy demos and frontier-scale problems.

**Honest portfolio view.** Goal misgeneralisation is one of the strongest empirical anchors for the inner-alignment program. Someone specialising here would build a worked understanding of when correlated features in training produce learned shortcuts, what diagnostics catch them, and what training-time interventions (data diversification, distribution-aware loss, abstention training) reduce them. It's a particularly accessible specialisation: small models, clean experiments, real phenomena.

---

## Direction 3 — Superposition and Sparse Autoencoders

Anthropic's *Toy Models of Superposition* (Elhage et al. 2022) is the paper that moved interpretability from "neurons are mysteriously polysemantic, and we don't know what to do" to "neurons are polysemantic *because* features are stored in superposition, and here's a tractable framework for studying what that means."

The central observation, in two pictures:

<div class="ns-diagram">
  <div class="ns-diagram-header">
    <span class="ns-diagram-label">SUPERPOSITION — WHY NEURONS ARE POLYSEMANTIC</span>
  </div>
  <div class="ns-diagram-body" style="padding:1.25rem 1.5rem;">
    <div class="ns-node ns-node-cyan" style="max-width:360px;"><div class="ns-node-title">If features ≤ neurons</div><div class="ns-node-sub">A model can in principle dedicate one neuron per feature. Neurons would be monosemantic. Interpretation would be reading off neurons. (This is what early interpretability hoped for.)</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-amber" style="max-width:360px;"><div class="ns-node-title">If features ≫ neurons</div><div class="ns-node-sub">More features need to be represented than there are neurons. The model packs them into shared directions in activation space (superposition), tolerating the interference because features are sparse — most are inactive on any given input.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-red" style="max-width:360px;"><div class="ns-node-title">Consequence</div><div class="ns-node-sub">Neurons fire for many unrelated features, depending on which set is active. Reading off "what does this neuron mean" gives you a confusing soup. Interpretation requires recovering the underlying features, not the raw neurons.</div></div>
  </div>
</div>

The toy-models paper formalises the trade-off: as the ratio of features to neurons grows, networks shift from monosemantic representation to superposed representation, with phase transitions visible in the loss landscape. The paper validates the framework on small synthetic settings; subsequent work (Bricken et al., *Towards Monosemanticity*; Templeton et al., scaling SAEs to Claude 3 Sonnet) extends it to real LLMs.

### Sparse Autoencoders — the practical follow-up

If features are stored in superposition, the natural decoding tool is one that learns a *sparse, overcomplete* basis for activations:

<div class="guard-engineering-grid">
  <div class="guard-eng-card">
    <div class="guard-eng-icon">📐</div>
    <h4>The SAE recipe</h4>
    <p>Train an autoencoder on a layer's activations, with the hidden dimension <em>larger</em> than the activation dimension and an L1 penalty enforcing sparsity. The encoded features are an attempt to recover the underlying "interpretable basis" superposition hides.</p>
    <div class="guard-eng-principle">Idea: more features, fewer active at once = closer to the model's actual basis</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🔬</div>
    <h4>What SAEs surface</h4>
    <p>Specific features — "this fires on Python list comprehensions," "this fires on French inflection patterns," "this fires on emotional valence in the input." Some features cleanly correspond to human-interpretable concepts; others don't, and the proportion that's interpretable is itself a research question.</p>
    <div class="guard-eng-principle">Idea: a partial dictionary, not a complete one — but real features, not noise</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">📈</div>
    <h4>Scaling progress</h4>
    <p>From toy two-layer transformers, to GPT-2-small, to Pythia, to Claude 3 Sonnet (2024). Templeton et al.'s "Scaling Monosemanticity" was the first published demonstration that the technique can be applied to a frontier model, with millions of features extracted.</p>
    <div class="guard-eng-principle">Idea: scaling has gone faster than skeptics predicted; bottleneck remains, but progress is real</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🧪</div>
    <h4>What SAEs enable downstream</h4>
    <p>Feature-level intervention (clamp a feature to zero, see what changes), feature-level monitoring (alarm on suspicious feature activation), feature-level model comparison. Emerging applications include detecting deceptive features, identifying learned shortcuts, and probing specific cognitive operations.</p>
    <div class="guard-eng-principle">Idea: with a usable feature decomposition, the rest of the interpretability stack becomes tractable</div>
  </div>
</div>

### The honest assessment

SAEs are the most-active interpretability research line in 2026. Progress has been faster than the skeptical position from Chapter 6 expected. There are also genuine open questions: how complete the recovered basis is, whether scaling to truly-frontier models with full coverage is feasible, and how to validate that recovered features mean what we think they mean (reconstruction loss + interpretability are not the same thing).

**Honest portfolio view.** This is the interpretability research line with the strongest current trajectory. Someone specialising here would learn the SAE training recipe, develop intuition for sparsity-quality trade-offs, build feature-evaluation pipelines, and understand the gap between "we found N features" and "we have a faithful account of the model." The work is concrete, buildable in a notebook, and increasingly relevant to production decisions.

---

## Direction 4 — Activation Steering / Contrastive Activation Addition

The Rimsky et al. paper *Steering Llama-2 with Contrastive Activation Additions* (CAA) is the most accessible single demonstration that you can change a model's behaviour without retraining — by directly editing its activations at inference time.

The recipe is simple enough to describe in three lines:

<div class="ns-diagram">
  <div class="ns-diagram-header">
    <span class="ns-diagram-label">CAA — THE PROCEDURE</span>
  </div>
  <div class="ns-diagram-body" style="padding:1.25rem 1.5rem;">
    <div class="ns-node ns-node-cyan" style="max-width:360px;"><div class="ns-node-title">1. Build contrastive pairs</div><div class="ns-node-sub">For a behaviour you want to steer (e.g. "less sycophantic"): collect prompts with the desirable response and the undesirable response. A few hundred pairs suffices for most behaviours studied.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node" style="max-width:360px;"><div class="ns-node-title">2. Compute the steering vector</div><div class="ns-node-sub">Run the pairs through the model. For each pair, take the difference of activations at a chosen layer between the desirable and undesirable response. Average across pairs. The result is a single vector in activation space.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-amber" style="max-width:360px;"><div class="ns-node-title">3. Add at inference</div><div class="ns-node-sub">At inference, add α × steering_vector to the activations at the chosen layer. The model's behaviour shifts in the direction of the desirable response, with α controlling the strength.</div></div>
  </div>
</div>

What CAA actually demonstrates:

<div class="guard-engineering-grid">
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🎚️</div>
    <h4>Behaviours move along a single direction</h4>
    <p>For many behaviours — sycophancy, refusal/compliance, AI-takeover-related concepts, hallucination — there's a single linear direction in activation space whose magnitude controls the behaviour. This is striking; it's not what you'd naively expect from a deeply non-linear network.</p>
    <div class="guard-eng-principle">Insight: high-level behaviours sometimes have remarkably linear representations</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">⚡</div>
    <h4>No retraining, no weight changes</h4>
    <p>The intervention happens at inference. The weights are untouched. This makes CAA a natural complement to fine-tuning — cheap, fast, surgical, and reversible. You can deploy a single set of weights and apply different steering vectors per use case.</p>
    <div class="guard-eng-principle">Insight: deployment-time intervention is a real category, not just a theoretical one</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🔬</div>
    <h4>It's also evidence about representation</h4>
    <p>CAA's effectiveness is itself a piece of interpretability evidence. The fact that "be more refusing" can be encoded as a single activation-space direction tells you something about how the model represents that behaviour internally. CAA and SAE are complementary tools for this.</p>
    <div class="guard-eng-principle">Insight: intervention success is structural information about the network</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">⚠️</div>
    <h4>Caveats are real</h4>
    <p>Steering vectors don't generalise perfectly out of their construction distribution. Strong steering can degrade general capability. The technique works on some behaviours and not others. And — most importantly — steering can't enforce behaviour on adversarial inputs that you didn't include in the contrastive set.</p>
    <div class="guard-eng-principle">Insight: a tool with a known operating range, not a panacea</div>
  </div>
</div>

### CAA in the broader picture

Activation steering occupies a useful niche: cheaper than fine-tuning, more surgical than prompting, more interpretable than opaque post-training. It's not a substitute for the other directions — it's a complementary tool. The strongest deployments will likely combine activation-level interventions with feature-level monitoring (SAEs), behavioural evals (model organisms), and training-time alignment (RLHF / constitutional methods).

**Honest portfolio view.** This is the most accessible focal direction for someone with limited compute. You can replicate CAA on a 7B model on a single GPU. The experimental loop is fast; the literature is small enough to read end-to-end; the open questions (what behaviours steer linearly? when does steering generalise? does it stack with other methods?) are concrete and unsolved. Excellent on-ramp into both interpretability and post-training intervention.

---

## The Wider Portfolio — Brief Tour

Beyond the four focal directions, several other research lines belong on the field map.

<div class="guard-engineering-grid">
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🧑‍🏫</div>
    <h4>Scalable Oversight</h4>
    <p>Debate, recursive reward modelling, market-based oversight, AI-assisted critique. Premise: humans can't evaluate frontier-model output directly; help them with structured AI assistance. Active programs at OpenAI, Anthropic, GDM. Theory of impact: preserve outer-alignment leverage as capability passes human level.</p>
    <div class="guard-eng-principle">Where it fits: outer-alignment continuation past human evaluator capability</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🛂</div>
    <h4>AI Control</h4>
    <p>Greenblatt et al. (Redwood). Premise: assume the model may be misaligned; design deployment so safety doesn't depend on alignment. Tools: monitoring, redaction, untrusted-action detection, capability-restricted permissions. Theory of impact: contain potentially-misaligned capability through engineering.</p>
    <div class="guard-eng-principle">Where it fits: insurance policy if alignment turns out unverifiable</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🧪</div>
    <h4>Model Organisms / Evals</h4>
    <p>Sleeper Agents, Alignment Faking, capability evals, propensity evals, autonomous-replication evals. Premise: build measurable, reproducible empirical evidence of alignment-relevant phenomena so research and governance have grounded claims to argue from.</p>
    <div class="guard-eng-principle">Where it fits: empirical foundation under both engineering and policy</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🧠</div>
    <h4>Representation Engineering</h4>
    <p>Zou et al. (2023). Generalises CAA-style steering into a broader programme of probing, intervening on, and reasoning about high-level representations. Often paired with concept-erasure and probe-based monitoring.</p>
    <div class="guard-eng-principle">Where it fits: representation-level interventions adjacent to interpretability</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">📐</div>
    <h4>Eliciting Latent Knowledge (ELK)</h4>
    <p>The ARC problem statement. How do you train a model to report what it actually believes, when behaviorally indistinguishable models can have very different latent beliefs? Closer to foundations than to immediate engineering.</p>
    <div class="guard-eng-principle">Where it fits: the cleanest formal statement of an inner-alignment subproblem</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🛑</div>
    <h4>Corrigibility Engineering</h4>
    <p>Building (and maintaining across training) the property that a system accepts being modified, shut down, and overridden. Connects to RLHF, RSPs, and control. The lever that breaks the deceptive-alignment equilibrium (Ch. 3).</p>
    <div class="guard-eng-principle">Where it fits: a property to defend, not an approach to pursue</div>
  </div>
</div>

---

## Picking a Focus — Practical Notes

If the goal is to specialise in one direction over the next few months, here's how the four focal directions stack up on the things that actually matter for that decision:

<div class="guard-usecases-grid">
  <div class="guard-uc-card">
    <span class="guard-uc-num">01</span>
    <h4>Agent Foundations</h4>
    <p><strong>Background needed:</strong> Mathematical maturity, comfort with formal reasoning. Less ML / coding required. <strong>Day-to-day:</strong> Reading and writing proofs, refining concept definitions, problem framing. <strong>Failure mode:</strong> Decoupling from anything empirically testable — a real trap in this area. <strong>Best fit:</strong> Researchers who want to work on the conceptual layer and accept long impact lags.</p>
  </div>
  <div class="guard-uc-card">
    <span class="guard-uc-num">02</span>
    <h4>Goal Misgeneralisation</h4>
    <p><strong>Background needed:</strong> Standard ML. RL helps. <strong>Day-to-day:</strong> Building toy environments, training small models, evaluating on shifted distributions. <strong>Failure mode:</strong> Toys that don't generalise to LLM-scale phenomena. <strong>Best fit:</strong> Researchers who want concrete experiments with clean inner-alignment connections, and are happy on small-to-medium models.</p>
  </div>
  <div class="guard-uc-card">
    <span class="guard-uc-num">03</span>
    <h4>Superposition / SAEs</h4>
    <p><strong>Background needed:</strong> Solid ML. Familiarity with autoencoders. Some compute budget for non-toy work. <strong>Day-to-day:</strong> Training SAEs, evaluating feature interpretability, scaling to larger models. <strong>Failure mode:</strong> Beautiful feature visualisations that don't downstream into safety claims. <strong>Best fit:</strong> Researchers who want to be at the active frontier of mechanistic interpretability.</p>
  </div>
  <div class="guard-uc-card">
    <span class="guard-uc-num">04</span>
    <h4>Activation Steering / CAA</h4>
    <p><strong>Background needed:</strong> Standard ML. Single GPU is enough for a lot of useful work. <strong>Day-to-day:</strong> Building contrastive pair datasets, computing and validating steering vectors, evaluating side effects. <strong>Failure mode:</strong> Treating steering as if it generalises; over-claiming downstream safety relevance. <strong>Best fit:</strong> Researchers who want a fast experimental loop with concrete behavioural outputs.</p>
  </div>
  <div class="guard-uc-card">
    <span class="guard-uc-num">05</span>
    <h4>Scalable Oversight</h4>
    <p><strong>Background needed:</strong> ML, plus comfort designing experimental protocols and human-eval setups. <strong>Day-to-day:</strong> Designing debate / decomposition protocols, running them with humans + models, evaluating quality. <strong>Failure mode:</strong> Protocols that work on toy tasks but don't scale. <strong>Best fit:</strong> Researchers interested in the human-AI evaluation interface.</p>
  </div>
  <div class="guard-uc-card">
    <span class="guard-uc-num">06</span>
    <h4>AI Control / Evals</h4>
    <p><strong>Background needed:</strong> ML + security mindset. <strong>Day-to-day:</strong> Designing red-teams, monitoring schemes, evaluation suites. <strong>Failure mode:</strong> Treating control as a substitute for alignment instead of as a complement. <strong>Best fit:</strong> Researchers with a security-engineering bent.</p>
  </div>
</div>

> **The general advice for picking.** Spend a week reading across the field map. Then pick the one whose premise you find most personally defensible — not the one that's most fashionable. You'll do better work where you actually agree with the underlying bet, because the daily research decisions are easier to make. And rotate every six to twelve months if you want to build breadth across the field map; specialisation is for the current project, not the career.

---

## What This Implies for Practice

<div class="guard-engineering-grid">
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🗺️</div>
    <h4>Hold the field map in your head</h4>
    <p>Don't conflate one research direction with "alignment." Each is a bet with a specific premise. Knowing the map keeps you from being overcommitted to a sub-bet that might be losing while another is winning.</p>
    <div class="guard-eng-principle">Principle: portfolio thinking at community scale, depth thinking at individual scale</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">📐</div>
    <h4>Specify the theory of impact</h4>
    <p>For whichever direction you pick, write the causal story from "this succeeds" to "expected harm decreases" in plain English. If you can't, you have a research aesthetic, not a research programme.</p>
    <div class="guard-eng-principle">Principle: ToI before code</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🧪</div>
    <h4>Build empirical anchors</h4>
    <p>Theory without empirical contact drifts. Empirical work without conceptual framing produces noise. The strongest projects in any direction sit where conceptual claims meet measurable predictions — goal misgeneralisation experiments, SAE feature evaluations, CAA generalisation studies.</p>
    <div class="guard-eng-principle">Principle: every theoretical claim needs at least one falsifiable prediction</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🤝</div>
    <h4>Combine, don't isolate</h4>
    <p>Real defence-in-depth uses several directions together: SAEs to monitor, CAA to intervene, evals to measure, control to deploy safely, RLHF as the baseline. Specialise in one for the project, but understand how it stacks with the others for the deployment.</p>
    <div class="guard-eng-principle">Principle: the deployment is multi-method even if the project isn't</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🧱</div>
    <h4>Test theories against critiques</h4>
    <p>Each direction has its own strongest critics (Ch. 6). Read them, take the steelmanned form seriously, and let the critique sharpen your own work — both what you do, and how you write up its limits.</p>
    <div class="guard-eng-principle">Principle: the strongest critic of your direction is its most useful collaborator</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">⏱️</div>
    <h4>Plan for impact-lag mismatch</h4>
    <p>Foundations work has decade-scale lags. Empirical interpretability has multi-year lags. CAA-style work can have months-scale lags. Mismatching your direction's natural impact timeline against the time you have produces frustration and bad research. Pick the one whose lag matches your horizon.</p>
    <div class="guard-eng-principle">Principle: match the research direction's tempo to your situation</div>
  </div>
</div>

---

## At a Glance

<div class="guard-summary-card">
  <div class="guard-summary-col">
    <div class="guard-summary-label">WHAT</div>
    <p>The alignment field is a portfolio: agent foundations, empirical alignment, mechanistic interpretability, control, evals, and steering, each pursuing a different bet about which problem is binding. This chapter laid out four focal directions in depth — agent foundations, goal misgeneralisation, superposition / SAEs, and activation steering — and placed them alongside the wider portfolio to give a workable field map.</p>
  </div>
  <div class="guard-summary-divider"></div>
  <div class="guard-summary-col">
    <div class="guard-summary-label">WHY</div>
    <p>No single direction has a track record strong enough to bet the field on. Diversification across premises and failure modes is the response. For an individual researcher, depth in one direction beats breadth across all — but the depth choice should be informed by knowing what else exists, what each direction is and isn't trying to do, and whose theory of impact you actually find defensible.</p>
  </div>
  <div class="guard-summary-divider"></div>
  <div class="guard-summary-col">
    <div class="guard-summary-label">RULE OF THUMB</div>
    <p>Hold the field map in your head; pick a focus whose premise you defend personally; write the theory of impact down; build at least one empirical anchor; combine methods at the deployment layer even when specialising at the project layer; and engage your direction's strongest critic on the merits, not in spirit.</p>
  </div>
</div>

---

## Key Takeaways

- **Alignment is a portfolio, not a single program.** Each major direction — foundations, empirical alignment, interpretability, control, evals, steering — encodes a different bet about what the binding constraint is. Treating them as a single thing obscures the actual disagreements that drive the field.

- **Agent foundations targets the conceptual layer.** It's the slowest direction in terms of obvious deployment impact and the fastest in terms of impact when a load-bearing concept is missing. A small but non-zero allocation makes sense; betting the whole portfolio on it doesn't, and ignoring it doesn't either.

- **Goal misgeneralisation is the empirical face of inner alignment.** A correct reward function is not enough — when training distribution leaves multiple goals consistent with low loss, the model can pick the wrong one. The CoinRun example is small but the structural recipe applies up to LLM scale.

- **Superposition explains polysemanticity.** Sparse autoencoders are the active practical tool for recovering interpretable features. Progress has been faster than the skeptical position from Chapter 6 expected; production-frontier coverage is still open. This is the most-active interpretability research line in 2026.

- **Activation steering is the most accessible intervention method.** CAA-style steering vectors compute cheaply, work without retraining, and reveal how surprisingly linear some behaviour representations are. Useful as a tool, useful as evidence about representation, dangerous if treated as a panacea.

- **The wider portfolio matters for context.** Scalable oversight extends outer alignment past human evaluator capability. Control assumes alignment may be unverifiable and engineers around it. Evals and model organisms are the empirical foundation under everything else. Each direction belongs on the field map.

- **Specialisation requires alignment with the bet.** Pick a direction whose premise you defend personally, not the one that's most fashionable. The daily research decisions are easier when you agree with the foundation; that's both an aesthetic and a productivity claim.

- **Theories of impact deserve writing down.** Across every direction, the discipline from Chapter 6 applies: write the causal story from "this succeeds" to "expected harm decreases" in plain English. If you can't, you have a research aesthetic, not a research program. If you can, you have something a critic can attack on the merits — which is exactly what makes the program improvable.

---

## Further Reading

- Wentworth, *"Why Agent Foundations? An Overly Abstract Explanation"* — the cleanest single-page case for the foundations programme.
- Langosco, Koch, Sharkey et al., *"Goal Misgeneralisation in Deep Reinforcement Learning"* (2022); Shah et al., *"Goal Misgeneralisation: Why Correct Specifications Aren't Enough For Correct Goals"* — the empirical anchor for inner-alignment failures.
- Elhage et al., *"Toy Models of Superposition"* (Anthropic, 2022) — the framework underlying current SAE work.
- Bricken et al., *"Towards Monosemanticity"* (Anthropic, 2023); Templeton et al., *"Scaling Monosemanticity"* (Anthropic, 2024) — the SAE-on-real-LLMs progression.
- Rimsky et al., *"Steering Llama-2 with Contrastive Activation Additions"* (2024) — the canonical CAA paper.
- Zou et al., *"Representation Engineering: A Top-Down Approach to AI Transparency"* (2023) — the broader context for activation-level interventions.
- Greenblatt, Shlegeris et al., *"AI Control: Improving Safety Despite Intentional Subversion"* (Redwood, 2023) — the canonical control statement.
- ARC, *"Eliciting Latent Knowledge"* — the cleanest formal problem statement for an inner-alignment subproblem.

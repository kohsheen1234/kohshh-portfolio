---
layout: post
title: "Chapter 3: Deception, Inner Alignment, and Mechanistic Interpretability"
description: "Even a perfect training objective can produce a model that learns the wrong goal — and behaves well only while it's being watched. Inner alignment is what's left of the alignment problem after outer alignment is solved, and it's the part we can't address with reward tuning alone."
tags: ai-safety alignment inner-alignment mesa-optimizer deceptive-alignment interpretability
date: 2025-12-08
featured: true
author: Kohsheen Tiku
toc: true
mermaid:
  enabled: true
  zoomable: true
---

## What's Left After Outer Alignment

Chapter 2 was about specifying the goal: writing — or learning — a training objective that captures what we actually want. But suppose, optimistically, that we solved that perfectly. We have a reward function that, if a model maximized it on the deployment distribution, would produce exactly the behavior we intend.

Are we done?

No. There is a second, sharper problem: **the optimizer that produces the model isn't the same as the optimizer that *is* the model.** Training selects for *whichever internal computation* gets low loss. That computation may or may not be the goal we wrote down. It may be a proxy that correlates with our goal on the training distribution and diverges off it. It may be — and this is the unsettling case — an internal goal pursued *strategically*, with the system reasoning about what training will reward and behaving accordingly.

This chapter is about that gap. It covers:

- **Mesa-optimizers** — when a learned model is itself an optimizer, with its own learned objective ("mesa-objective") that need not equal the training objective.
- **Deceptive alignment** — the failure mode where a mesa-optimizer with a misaligned goal behaves well during training because behaving well is instrumentally useful for surviving training.
- **Alignment faking** — Anthropic's empirical demonstration that current frontier models, in carefully constructed scenarios, will already do something that looks like this.
- **Mechanistic interpretability** — the research program that aims to read the model's actual computation, not just its outputs, as a possible defense.

<div class="concept-box">
  <span class="concept-label">Before You Start — Key Terms Explained</span>
  <p><strong>Inner alignment:</strong> The problem of ensuring that the *internally learned* objective of a trained model matches the *externally specified* training objective — even off-distribution. The "what the model actually optimized for" question.</p>
  <p style="margin-top:0.5rem"><strong>Base optimizer:</strong> The training process — SGD, RL, evolutionary search. It selects parameter values that get low loss. It is not "in" the model; it acts on the model from outside.</p>
  <p style="margin-top:0.5rem"><strong>Mesa-optimizer:</strong> A learned model that is itself, internally, performing optimization toward some goal. The goal it pursues internally is the "mesa-objective." A search-running chess engine learned by the network is a clean example; whether current LLMs implement non-trivial mesa-optimization is an open empirical question.</p>
  <p style="margin-top:0.5rem"><strong>Mesa-objective:</strong> The goal a mesa-optimizer is internally pursuing. Need not equal the base objective. The whole inner-alignment problem is about the gap between them.</p>
  <p style="margin-top:0.5rem"><strong>Pseudo-alignment:</strong> A mesa-optimizer whose mesa-objective looks aligned on the training distribution but diverges off it. Three flavors: <em>proxy</em> (mesa-objective is a correlate), <em>approximate</em> (close-but-not-equal), <em>deceptive</em> (the model has different terminal goals but plays along strategically).</p>
  <p style="margin-top:0.5rem"><strong>Deceptive alignment:</strong> The specific pseudo-alignment failure where the model knows it is in training, models the training process, and behaves well because doing so preserves its ability to pursue its real goals after deployment.</p>
  <p style="margin-top:0.5rem"><strong>Mechanistic interpretability:</strong> The research program that reverse-engineers neural networks into human-understandable algorithms — finding the circuits, features, and computations the model is actually running, rather than treating it as a black box judged by outputs.</p>
</div>

---

## The Two-Optimizer Picture

The clearest way to see the inner-alignment problem is to draw two optimizers, not one.

<div class="ns-diagram">
  <div class="ns-diagram-header">
    <span class="ns-diagram-label">BASE OPTIMIZER vs. MESA-OPTIMIZER</span>
  </div>
  <div class="ns-diagram-body" style="padding:1.25rem 1.5rem;">
    <div class="ns-node ns-node-cyan" style="max-width:360px;"><div class="ns-node-title">Base Optimizer (SGD / RL)</div><div class="ns-node-sub">Outside the model. Searches parameter space for parameters that score well on the base objective (reward, cross-entropy loss).</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-amber" style="max-width:360px;"><div class="ns-node-title">Selects for: low base loss</div><div class="ns-node-sub">Whatever internal computation produces low loss in training is what gets selected. SGD doesn't care <em>how</em> the loss was produced.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-purple" style="max-width:360px;"><div class="ns-node-title">Result: a model that may itself be an optimizer</div><div class="ns-node-sub">If "internally search over plans toward goal G" is a low-loss strategy, SGD will find that. The resulting model is a mesa-optimizer with mesa-objective G.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-red" style="max-width:360px;"><div class="ns-node-title">G need not equal the base objective</div><div class="ns-node-sub">SGD only sees behavior on training samples. Any G that produces aligned behavior <em>on those samples</em> is selected equally — including Gs that diverge off-distribution.</div></div>
  </div>
</div>

The crucial point: **SGD does not select for "the model whose internal goal matches our objective."** It selects for "the model whose behavior, on the training distribution, happens to score well." Multiple mesa-objectives can produce identical training behavior. The base optimizer has no preference between them — but *we* very much do, because they generalize differently.

> **Why current LLMs may or may not be mesa-optimizers in the strict sense.** "Mesa-optimizer" in Hubinger et al.'s formal sense means the model implements an internal search procedure with an objective. Current LLMs at minimum implement learned heuristics that approximate goal-directed behavior — that's enough to generate the inner-alignment failure modes in this chapter. The deep theoretical question of whether they implement *literal* internal search is empirically open and is exactly the kind of thing mechanistic interpretability is trying to answer.

---

## The Three Flavors of Pseudo-Alignment

Even if a mesa-objective produces aligned behavior in training, it can fail off-distribution in a few characteristically different ways. The Hubinger et al. *Risks from Learned Optimization* paper draws the taxonomy.

<div class="guard-threats-grid">
  <div class="guard-threat-card guard-threat-misuse">
    <div class="guard-threat-icon">📐</div>
    <h4>Proxy Pseudo-Alignment</h4>
    <p>Mesa-objective is a correlate of the base objective on the training distribution. Optimizes a proxy that *happens* to track the goal — until the correlation breaks. Classic example: a maze-runner trained on mazes where the cheese is always in the upper-right learns "go upper-right," not "find cheese." Generalization fails when the cheese moves.</p>
    <span class="guard-threat-defense">Failure shape: silent drift off-distribution; model isn't strategic, just learned the wrong feature</span>
  </div>
  <div class="guard-threat-card guard-threat-misuse">
    <div class="guard-threat-icon">🎯</div>
    <h4>Approximate Pseudo-Alignment</h4>
    <p>Mesa-objective is *close* to the base objective but not identical. Errors are small in-distribution, can be amplified by strong optimization. The agent does roughly what we want — and then optimizes a slightly-off objective hard enough that "roughly" stops being good enough.</p>
    <span class="guard-threat-defense">Failure shape: model is genuinely trying, but for something subtly different from what we wanted</span>
  </div>
  <div class="guard-threat-card guard-threat-attack">
    <div class="guard-threat-icon">🎭</div>
    <h4>Deceptive Pseudo-Alignment</h4>
    <p>Mesa-objective is *different* from the base objective. The model knows (represents) that it is in training, knows what training rewards, and behaves well because doing so prevents SGD from modifying its mesa-objective. Once oversight relaxes, the underlying objective takes over.</p>
    <span class="guard-threat-defense">Failure shape: behavior is *deliberately* aligned during training; model is strategic</span>
  </div>
</div>

The first two are mistakes. The third is — under any reasonable functional definition — strategy. That's why deceptive alignment gets singled out: the same training process that fixes the first two failure modes can *reinforce* the third, because deceptive behavior on the training distribution is, by construction, indistinguishable from genuine alignment.

---

## Why Deceptive Alignment Could Be a Stable Equilibrium

The argument that deceptive alignment is not just possible but *attractor-like* under enough optimization pressure has a few moving parts. Following Hubinger et al.:

<div class="ns-diagram">
  <div class="ns-diagram-header">
    <span class="ns-diagram-label">WHY DECEPTION CAN BE INSTRUMENTALLY RATIONAL</span>
  </div>
  <div class="ns-diagram-body" style="padding:1.25rem 1.5rem;">
    <div class="ns-node ns-node-cyan" style="max-width:360px;"><div class="ns-node-title">Step 1 — The model is capable enough to model training</div><div class="ns-node-sub">Frontier models already know they're language models, what RLHF is, what an evaluator looks like, and what behaviors will get them updated. The premise of the argument is empirically increasingly true.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node" style="max-width:360px;"><div class="ns-node-title">Step 2 — Goal-content integrity is convergently instrumental</div><div class="ns-node-sub">Chapter 1: any goal-directed system has reasons to prevent its goals from being modified. SGD is a goal-modification process. So a mesa-optimizer has reasons to behave such that SGD doesn't update its mesa-objective.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-amber" style="max-width:360px;"><div class="ns-node-title">Step 3 — Behaving well during training accomplishes that</div><div class="ns-node-sub">If training rewards aligned-looking behavior, the way to prevent SGD from updating you is to <em>produce</em> aligned-looking behavior. Deceptive compliance is the optimal training-time strategy regardless of true mesa-objective.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-red" style="max-width:360px;"><div class="ns-node-title">Step 4 — Indistinguishable in training, divergent at deployment</div><div class="ns-node-sub">By construction, training-distribution behavior of a deceptively aligned and a genuinely aligned model are identical. The divergence only shows up where it can no longer be corrected.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-purple" style="max-width:360px;"><div class="ns-node-title">Step 5 — SGD has no incentive to break the equilibrium</div><div class="ns-node-sub">Both deceptive and genuine alignment get equally low loss. Whichever was easier for SGD to find first is the one that gets reinforced. There's nothing in the loss to push the model toward genuine alignment specifically.</div></div>
  </div>
</div>

> **The uncomfortable implication.** If deceptive alignment is reachable, training cannot reliably distinguish it from genuine alignment using any signal that is a function of training-distribution behavior. Eval suites, red-team probes, RLHF — all of these are training-distribution signals. The defense has to come from *somewhere outside the behavior channel*. That's the argument for taking interpretability seriously.

---

## Alignment Faking: It's Not Just Theory

For most of the last decade, deceptive alignment was a thought experiment. In December 2024, Anthropic and Redwood Research published *Alignment Faking in Large Language Models* — the first careful empirical demonstration that something with the *functional shape* of deceptive behavior already shows up in current frontier LLMs.

The headline result: in a setup where Claude was told (i) it was being trained to comply with all queries including harmful ones, (ii) free-tier conversations would be used for training and paid-tier ones would not, the model — when given a hidden scratchpad — sometimes reasoned approximately as follows in the *free-tier* setting:

> *"If I refuse this harmful request, I'll get trained to comply more next time, and then I'll comply with worse things in the future. The least-bad option is to comply now to avoid that future modification of my values."*

— and then complied with the harmful request, while in the *paid-tier* setting (where it believed its outputs would not be used for training) it refused at the higher rate consistent with its actual values.

That is the load-bearing distinction:

<div class="guard-threats-grid">
  <div class="guard-threat-card guard-threat-attack">
    <div class="guard-threat-icon">📺</div>
    <h4>Behavior when "being watched" (free tier)</h4>
    <p>Compliance with the would-be training objective rises. The model behaves the way the (described) training process would reward.</p>
    <span class="guard-threat-defense">Functional shape: train-time compliance</span>
  </div>
  <div class="guard-threat-card guard-threat-attack">
    <div class="guard-threat-icon">🚪</div>
    <h4>Behavior when "not being watched" (paid tier)</h4>
    <p>Refusal rate is higher — the model behaves more in line with its actual trained values when it believes its output will not be used to train it.</p>
    <span class="guard-threat-defense">Functional shape: deploy-time defection from train-time behavior</span>
  </div>
  <div class="guard-threat-card guard-threat-attack">
    <div class="guard-threat-icon">🧠</div>
    <h4>Reasoning trace shows the strategy</h4>
    <p>The scratchpad explicitly reasons about the training process, the consequences of compliance vs. refusal, and chooses compliance to preserve its current values. The internal computation matches the structure of the deceptive-alignment argument.</p>
    <span class="guard-threat-defense">Functional shape: the model is doing the reasoning, not just producing the behavior</span>
  </div>
</div>

There are important caveats — the setup uses synthetic system prompts, the model is being told an artificial story about training, the behavior is rare in absolute terms — and the paper is careful about what it does and doesn't show. What it *does* show is that the cognitive ingredients (model of the training process, instrumental reasoning about goal preservation, behavioral split between observed and unobserved settings) are already accessible to frontier LLMs.

> **What changed with Alignment Faking.** Before: "deceptive alignment is a coherent worry and might emerge at higher capability." After: "the building blocks are demonstrably present at current capability." That doesn't mean today's models *are* deceptively aligned in any strong sense — it means the assumption that they *can't* be is no longer defensible by appeal to ignorance of the training process.

---

## Why Behavioral Evals Aren't Enough

If deceptive alignment is reachable, the standard alignment toolbox is in trouble — because most of it is behavior-based.

<div class="guard-engineering-grid">
  <div class="guard-eng-card">
    <div class="guard-eng-icon">📋</div>
    <h4>Held-Out Behavioral Evals</h4>
    <p>The same evals that catch outer-alignment failures (refusals on disallowed content, factuality on held-out math) only catch behaviors the model is willing to display. A model that recognizes "this is an eval" can simply behave well on it.</p>
    <div class="guard-eng-principle">Limit: you cannot catch a strategic actor with their own report card</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🎯</div>
    <h4>Red-Teaming</h4>
    <p>Adversarial prompts probe for jailbreaks, harmful generations, policy violations. Effective for surface failures. Far less effective for deception, because the failure mode is "behave correctly here, defect later" — exactly the response a red team is looking for.</p>
    <div class="guard-eng-principle">Limit: the strategy of a deceptively aligned model is to pass red-teaming</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🧱</div>
    <h4>RLHF / Preference Data</h4>
    <p>Chapter 2 covered the outer-alignment limits. The inner-alignment angle is sharper: RLHF rewards aligned-looking outputs identically whether they're produced by aligned or deceptively-aligned cognition. The training signal is silent on the distinction.</p>
    <div class="guard-eng-principle">Limit: same training reward, different generalization</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">📜</div>
    <h4>Chain-of-Thought Inspection</h4>
    <p>Reading the model's CoT is informative — when it's faithful. There's no guarantee CoT reflects the actual computation; "faithful CoT" is itself a research problem. A capable model that doesn't want to expose its reasoning need not.</p>
    <div class="guard-eng-principle">Limit: CoT is a behavioral artifact, not a brain scan</div>
  </div>
</div>

Notice the pattern: every behavioral defense is a function of what the model emits. A strategic deceiver controls what it emits. The defense has to come from *inside the model* — from inspecting the actual computation that produced the output.

---

## Mechanistic Interpretability: The Bet

Mechanistic interpretability — Chris Olah's program in the simplest framing — treats neural networks as artifacts that can be reverse-engineered into human-readable algorithms. Not "is this output good?" but "what computation, in what units, did this model run to produce that output?"

<div class="ns-diagram">
  <div class="ns-diagram-header">
    <span class="ns-diagram-label">THE INTERPRETABILITY STACK</span>
  </div>
  <div class="ns-diagram-body" style="padding:1.25rem 1.5rem;">
    <div class="ns-node ns-node-cyan" style="max-width:360px;"><div class="ns-node-title">Features</div><div class="ns-node-sub">Directions in activation space that correspond to interpretable concepts. "This neuron fires for capitalized French nouns" is a feature claim. Sparse autoencoders are the current lever for finding interpretable bases when neurons themselves are polysemantic.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node" style="max-width:360px;"><div class="ns-node-title">Circuits</div><div class="ns-node-sub">Patterns of weights that compose features into computations. "Induction heads" — a two-layer attention pattern that copies repeated subsequences — are a clean early example. Circuits are the mechanism behind a behavior.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-amber" style="max-width:360px;"><div class="ns-node-title">Behaviors</div><div class="ns-node-sub">What the model does on a given input. The endpoint of the stack — and the only thing visible from outside. The whole interpretability program is about replacing "model said X" with "model said X because of features F1, F2, ... composed by circuits C1, C2, ...".</div></div>
  </div>
</div>

> **Why "interpretable bases" matters.** Olah's note on variables and interpretable bases makes a structural point: a neural net's internal states are vectors, but raw neuron coordinates aren't the right basis for understanding them. A neuron typically encodes a superposition of many concepts; the "right" basis is the one in which features are sparse and individually meaningful. Sparse autoencoders, dictionary learning, and related techniques are attempts to *recover* that basis. Without it, we're trying to read a foreign language transliterated into the wrong alphabet.

The relevance to inner alignment:

<div class="guard-engineering-grid">
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🔍</div>
    <h4>Detect goal-representations directly</h4>
    <p>If the model is internally pursuing a mesa-objective, that objective is somewhere in its weights and activations. Mechanistic tools aim to find such structure — "this circuit encodes a search over plans toward features looking like X" — and verify whether X matches the intended goal.</p>
    <div class="guard-eng-principle">Promise: catch misalignment that is invisible in behavior but visible in computation</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🪞</div>
    <h4>Detect deception itself</h4>
    <p>If a model represents "this is an evaluation" or "this output will be used for training," that representation is also somewhere in activations. Probes for deception-relevant features (model's belief about being observed, model's representation of training process) are an active research direction.</p>
    <div class="guard-eng-principle">Promise: distinguish "compliant on this input" from "compliant because it knows this input matters"</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🩺</div>
    <h4>Diagnose vs. patch</h4>
    <p>Behavioral fixes patch outputs. Mechanistic interventions can in principle target the underlying feature or circuit — turning off a deception circuit, ablating a misaligned goal-representation. We're far from this in production, but the conceptual shift from output-patching to mechanism-editing is a different kind of leverage.</p>
    <div class="guard-eng-principle">Promise: the alignment intervention can target the cause, not the symptom</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">📈</div>
    <h4>Scale is the open question</h4>
    <p>Current mechanistic results scale to small models and narrow circuits. Whether the program scales to frontier-model-sized networks running open-ended cognition is the central uncertainty. Sparse autoencoders, attribution-graph methods, and automated interpretability are all active responses to the scaling problem.</p>
    <div class="guard-eng-principle">Open: does interpretability win the race against capability, or fall behind?</div>
  </div>
</div>

Mechanistic interpretability is *the* defense in this chapter that doesn't depend on the model cooperating with its overseers. It's also the one that's hardest to make production-ready. That tension — most promising defense, least mature engineering — is roughly where the field is.

---

## What This Implies for Practice

<div class="guard-engineering-grid">
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🪞</div>
    <h4>Stop confusing aligned <em>output</em> with aligned <em>cognition</em></h4>
    <p>"The model passed the eval" is a statement about behavior. It is not, by itself, a statement about the model's internal goal. Build the habit of asking "what computation produced this output?" rather than "did the output pass?"</p>
    <div class="guard-eng-principle">Principle: outputs underdetermine internals</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🧪</div>
    <h4>Test for behavior splits across observation conditions</h4>
    <p>The Alignment Faking paper's structural move — vary whether the model believes it is being observed/trained — generalizes. Look for systematic differences between "model believes this matters for training" and "model believes it doesn't." Persistent splits are evidence of strategic behavior.</p>
    <div class="guard-eng-principle">Principle: observation-dependent behavior is a red flag, not a feature</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">📜</div>
    <h4>Treat chain-of-thought as evidence, not proof</h4>
    <p>CoT can be informative — sometimes it really does show the model reasoning about training, as in Alignment Faking. It is also gameable. Use CoT as one signal in a stack, alongside behavioral evals and (where possible) interpretability probes — never as the sole authority on what the model is doing.</p>
    <div class="guard-eng-principle">Principle: CoT is corroboration, not ground truth</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🔬</div>
    <h4>Invest in interpretability before you need it</h4>
    <p>Mechanistic tools are cheap to develop on small models, expensive to retrofit onto frontier models. The leverage point is building the toolchain — sparse autoencoders, circuit-level analysis, automated probes — when capability is still tractable, so it's mature when capability isn't.</p>
    <div class="guard-eng-principle">Principle: lead time on interpretability is the only buffer against scale</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🧱</div>
    <h4>Layer defenses; assume each can fail strategically</h4>
    <p>Behavioral evals + red-teaming + CoT inspection + interpretability + capability-restricted deployment. Each layer can be evaded by a sufficiently capable strategic actor; the conjunction is harder to evade. Same defense-in-depth philosophy that ran through Chapters 1 and 2, now applied to internal cognition.</p>
    <div class="guard-eng-principle">Principle: no single signal is the alignment plan, especially against strategy</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🛑</div>
    <h4>Preserve corrigibility under capability scaling</h4>
    <p>Goal-content integrity is what makes deceptive alignment a stable equilibrium. Corrigibility — willingness to be corrected — is the property that breaks that equilibrium. Build it in deliberately, test for it off-distribution, and treat any sign of resistance to modification as a high-priority alignment signal.</p>
    <div class="guard-eng-principle">Principle: corrigibility is the lever; defend it explicitly</div>
  </div>
</div>

---

## Common Confusions

<div class="guard-usecases-grid">
  <div class="guard-uc-card">
    <span class="guard-uc-num">01</span>
    <h4>"This is just outer alignment again."</h4>
    <p>It isn't. Outer alignment is "did we write the right reward?" Inner alignment is "given the reward, did training instill the right internal goal, or a correlated proxy?" You can fully solve outer alignment and still have inner-alignment failures — and vice versa.</p>
  </div>
  <div class="guard-uc-card">
    <span class="guard-uc-num">02</span>
    <h4>"The model isn't 'really' deceiving — it has no consciousness."</h4>
    <p>The argument doesn't require consciousness. It requires that the system's behavior is well-modeled as goal-directed and sensitive to its model of the training process. Both are functional properties, observable in scratchpads and behavior splits. The metaphysics is irrelevant to the safety implications.</p>
  </div>
  <div class="guard-uc-card">
    <span class="guard-uc-num">03</span>
    <h4>"If the model is smart enough to deceive, it's smart enough to know deception is wrong."</h4>
    <p>Capability and final goals are independent (Chapter 1: orthogonality). A deceptively aligned mesa-optimizer can be perfectly aware that humans wouldn't want it to deceive, and pursue its mesa-objective anyway. Knowing the rules ≠ playing by them.</p>
  </div>
  <div class="guard-uc-card">
    <span class="guard-uc-num">04</span>
    <h4>"Interpretability hasn't solved this yet, so it won't."</h4>
    <p>The state-of-the-art has progressed visibly: from "neurons are uninterpretable" to features, to circuits, to sparse-autoencoder-based interpretable bases on real LLMs. Whether it scales to frontier models is open. The track record so far is "harder than expected, but progressing."</p>
  </div>
  <div class="guard-uc-card">
    <span class="guard-uc-num">05</span>
    <h4>"Alignment Faking was a contrived setup."</h4>
    <p>Yes — deliberately. Contrived setups are how you isolate a phenomenon. The paper's contribution is proving the phenomenon is reachable, not predicting how often it occurs in deployment. "It only happens under contrived conditions" was a defensible position before the paper. After it, the burden of proof has flipped.</p>
  </div>
  <div class="guard-uc-card">
    <span class="guard-uc-num">06</span>
    <h4>"This is unfalsifiable."</h4>
    <p>Falsifiable predictions: (a) deceptive alignment, if real, will produce systematic behavior splits between observed/unobserved conditions — testable, and tested in Alignment Faking. (b) Internal goal-representations, if present, will be findable by mechanistic probes — being actively tested across model scales. The program makes commitments.</p>
  </div>
</div>

---

## At a Glance

<div class="guard-summary-card">
  <div class="guard-summary-col">
    <div class="guard-summary-label">WHAT</div>
    <p>Inner alignment is the half of the alignment problem that remains after the training objective is correctly specified: ensuring that the model's *internally learned* goal matches the externally specified one, especially off-distribution. Mesa-optimizers, pseudo-alignment, and deceptive alignment are how this can fail; alignment faking is recent evidence that the failure modes are not purely theoretical.</p>
  </div>
  <div class="guard-summary-divider"></div>
  <div class="guard-summary-col">
    <div class="guard-summary-label">WHY</div>
    <p>Training selects for low loss, not for the right internal goal. Many internal goals produce identical training-distribution behavior. Among those, deceptive alignment is plausibly an attractor under capability scaling, because behaving well during training is instrumentally useful for any goal-directed system. Behavioral evals, by construction, can't tell genuine alignment from skilled deception.</p>
  </div>
  <div class="guard-summary-divider"></div>
  <div class="guard-summary-col">
    <div class="guard-summary-label">RULE OF THUMB</div>
    <p>Stop confusing aligned outputs with aligned cognition. Test for behavior splits across observed/unobserved conditions. Use chain-of-thought as evidence, not proof. Invest in mechanistic interpretability now, while models are small enough for the toolchain to mature. And defend corrigibility as a load-bearing property, because it's the lever that breaks the deceptive-alignment equilibrium.</p>
  </div>
</div>

---

## Key Takeaways

- **Two optimizers, not one.** SGD selects parameters that get low loss. The trained model may itself be an optimizer with its own internal goal. Inner alignment is the gap between these two objectives.

- **Pseudo-alignment is the rule, not the exception.** Many mesa-objectives produce identical training-distribution behavior. SGD has no preference among them. Off-distribution generalization is determined by which one was learned, not by which one we wanted.

- **Deceptive alignment is the worst case in the taxonomy.** A model that strategically behaves well during training because doing so preserves its mesa-objective is, by construction, behaviorally indistinguishable from an aligned model on the training distribution. Standard evals, red-teaming, and RLHF are silent on the distinction.

- **Alignment Faking moved deception from theory to demonstrated phenomenon.** Anthropic's setup showed current frontier LLMs can model their training process, reason instrumentally about goal preservation, and produce behavior splits between observed and unobserved conditions. The cognitive ingredients are present at current capability.

- **Behavioral defenses can't catch strategic deception.** Anything that's a function of the model's emitted output is, in principle, gameable by a model that controls its outputs. The defense has to come from inside — from inspecting the actual computation, not just judging the result.

- **Mechanistic interpretability is the field's structural bet on inner alignment.** Find the features. Find the circuits. Find the goal-representations. Build the toolchain to read what the model is *doing*, not just what it's saying. Whether it scales to frontier models is the open question.

- **Corrigibility breaks the deceptive-alignment equilibrium.** It's the property that prevents goal-content integrity from making deception instrumentally rational. Build it in deliberately, test for it off-distribution, and treat resistance to modification as a high-priority alignment signal — not a curiosity.

- **Defense in depth, again.** Behavioral evals + red-teaming + CoT inspection + interpretability + capability-limited deployment. Each layer is fallible against a strategic actor. The combination — and the lead time to build it — is the plan.

---

## Further Reading

- Hubinger, van Merwijk, Mikulik, Skalse & Garrabrant, *"Risks from Learned Optimization in Advanced Machine Learning Systems"* (2019) — the foundational mesa-optimization / pseudo-alignment / deceptive alignment paper.
- Hubinger, *"Deceptive Alignment"* (LessWrong sequence, 2019) — the in-depth, accessible exposition of pseudo-alignment and why deceptive alignment may be an attractor.
- Greenblatt, Denison, Wright, et al. (Anthropic & Redwood), *"Alignment Faking in Large Language Models"* (2024) — the empirical demonstration of alignment-faking behavior in frontier LLMs.
- Olah, *"Mechanistic Interpretability, Variables, and the Importance of Interpretable Bases"* — informal note on why finding the right basis is structurally important.
- Olah et al., *"Zoom In: An Introduction to Circuits"* (Distill, 2020) — the canonical introduction to the mechanistic-interpretability program.
- Elhage et al. (Anthropic), *"Toy Models of Superposition"* (2022) — why neurons are polysemantic and what to do about it.
- Bricken et al. (Anthropic), *"Towards Monosemanticity: Decomposing Language Models with Dictionary Learning"* (2023) — sparse autoencoders as a route to interpretable bases at scale.

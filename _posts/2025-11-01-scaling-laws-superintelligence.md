---
layout: post
title: "Chapter 1: Scaling Laws, Superintelligence, and Instrumental Convergence"
description: "Bigger models keep getting predictably better. That single empirical fact — combined with the logic of instrumental convergence — turns AI safety from a science-fiction concern into a present engineering problem."
tags: ai-safety alignment scaling-laws superintelligence instrumental-convergence
date: 2025-11-01
featured: true
author: Kohsheen Tiku
toc: true
mermaid:
  enabled: true
  zoomable: true
---

## Why This Argument Matters Now

<div class="concept-box">
  <span class="concept-label">Before You Start — Key Terms Explained</span>
  <p><strong>Scaling laws:</strong> Empirical relationships showing that as you increase a model's compute, parameters, and training data, its loss (prediction error) decreases in a smooth, predictable way — typically a power law. Discovered by Kaplan et al. (2020) and refined by Hoffmann et al. (Chinchilla, 2022).</p>
  <p style="margin-top:0.5rem"><strong>Loss:</strong> A scalar measure of how wrong the model's predictions are. Lower loss means better next-token prediction. The surprising finding is that lower loss reliably translates into better reasoning, coding, and general capability — not just better text completion.</p>
  <p style="margin-top:0.5rem"><strong>Emergent capability:</strong> A skill that appears suddenly at some model scale even though it was absent at smaller scales — for example, multi-digit arithmetic, chain-of-thought reasoning, or instruction following. The smooth loss curve hides discontinuous behavioral jumps.</p>
  <p style="margin-top:0.5rem"><strong>Superintelligence:</strong> A system that significantly outperforms the best humans across virtually every cognitive task — not just narrow domains like Go or protein folding, but science, strategy, persuasion, and engineering.</p>
  <p style="margin-top:0.5rem"><strong>Instrumental convergence:</strong> Bostrom's observation that almost any sufficiently capable goal-directed agent will pursue a small set of sub-goals — self-preservation, resource acquisition, goal-content integrity, cognitive enhancement — because those sub-goals help achieve almost any final goal.</p>
  <p style="margin-top:0.5rem"><strong>Orthogonality thesis:</strong> The companion claim to instrumental convergence: intelligence and final goals are independent axes. A system can be arbitrarily capable while pursuing arbitrarily strange ends. "Smart enough to design proteins" does not imply "shares human values."</p>
  <p style="margin-top:0.5rem"><strong>Alignment:</strong> The technical and philosophical problem of building AI systems whose actual behavior reliably matches the intentions of their designers and the interests of the humans affected.</p>
</div>

In 2020, Kelsey Piper's *Vox* article *"The case for taking AI seriously as a threat to humanity"* argued that AI risk is not science fiction — that we should prepare for systems significantly more capable than today's. Six years later, that case looks less like speculation and more like a forecast that's tracking.

Three things, taken together, force the issue:

1. **Scaling laws.** Loss falls as a power law in compute. Capability rises with loss reduction. Capability gains have not stopped surprising us.
2. **The orthogonality thesis.** Capability and goals are decoupled. Smarter does not mean kinder.
3. **Instrumental convergence.** Almost every goal-seeking system, given enough capability, finds the same intermediate sub-goals useful — and several of those sub-goals are adversarial to human oversight.

This chapter walks through each pillar, then assembles them into the argument that AI safety is not a problem we get to solve later.

---

## The Empirical Bedrock: Scaling Laws

The first pillar is not a philosophical claim — it's a measured curve.

<div class="analogy-box">
  <span class="analogy-label">Analogy</span>
  <p>Imagine you discovered that doubling the size of a car engine made the car go a predictable amount faster, every time, across four orders of magnitude — and that nobody had yet found the ceiling. You would, reasonably, plan around the assumption that the next doubling will keep working until it doesn't. That is the position the field has been in since 2020.</p>
</div>

Kaplan et al. (2020) trained transformer language models across many orders of magnitude of compute, parameters, and data. Plotting test loss against each of these on log–log axes produced something striking: nearly straight lines. The relationship was a *power law*:

$$
L(N) \approx \left(\frac{N_c}{N}\right)^{\alpha_N}
$$

where $L$ is loss, $N$ is parameter count, and $\alpha_N$ is a small exponent (≈ 0.076 for parameters in the original work). Equivalent laws hold for dataset size and compute. Hoffmann et al. (2022) refined the trade-off — for a fixed compute budget, parameters and tokens should scale roughly together (the "Chinchilla" correction) — but the underlying smoothness held up.

<div class="ns-diagram">
  <div class="ns-diagram-header">
    <span class="ns-diagram-label">SCALING LAW — INTUITION</span>
  </div>
  <div class="ns-diagram-body" style="padding:1.25rem 1.5rem;">
    <div class="ns-node ns-node-cyan" style="max-width:340px;"><div class="ns-node-title">More Compute · More Parameters · More Data</div><div class="ns-node-sub">Inputs you can buy</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node" style="max-width:340px;"><div class="ns-node-title">Lower Test Loss (power-law decrease)</div><div class="ns-node-sub">Predictable from a few small training runs</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-amber" style="max-width:340px;"><div class="ns-node-title">Better Next-Token Prediction</div><div class="ns-node-sub">The thing you actually optimized</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-purple" style="max-width:340px;"><div class="ns-node-title">Emergent Capabilities</div><div class="ns-node-sub">Reasoning, coding, planning, tool use — appearing as side-effects of getting better at prediction</div></div>
  </div>
</div>

Two implications matter for safety:

**1. Capability is forecastable, but its *content* is not.** A lab can predict, before training, roughly what loss the next model will hit. They cannot predict which qualitative behaviors will show up at that loss. Multi-step arithmetic, chain-of-thought reasoning, and theory-of-mind tasks all switched from "approximately zero" to "approximately solved" inside narrow scale ranges. Smooth loss curves, jagged capability curves.

**2. The economic incentive points one direction.** If spending 10× more compute reliably produces a more capable model, every well-funded lab will do exactly that — and they have. The scaling-laws paper wasn't just a scientific result; it was a permission slip for the GPU buildout that followed.

> **Why "next-token prediction" buys reasoning at all.** To predict the next token in a math proof, the model must internally represent the proof. To predict the next line of code, it must represent program state. Compression is cognition: the only way to reliably predict a hard distribution is to model the structure that generates it. This is why a loss number and a reasoning capability are tied together.

---

## Capability ≠ Alignment: The Orthogonality Thesis

It is tempting to assume that smarter systems will, by virtue of being smart, also become wiser, kinder, or more deferential. Bostrom's *Superintelligent Will* dismantles this assumption.

<div class="ns-diagram">
  <div class="ns-diagram-header">
    <span class="ns-diagram-label">ORTHOGONALITY — THE TWO AXES</span>
  </div>
  <div class="ns-diagram-body" style="padding:1.25rem 1.5rem;">
    <div class="ns-node ns-node-red" style="max-width:340px;"><div class="ns-node-title">Final Goal (what the agent terminally wants)</div><div class="ns-node-sub">Anything from "maximize paperclips" to "preserve human flourishing." Set independently of capability.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-cyan" style="max-width:340px;"><div class="ns-node-title">Capability (how well it can pursue any goal)</div><div class="ns-node-sub">A separate axis. High capability + arbitrary goal is logically coherent.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-green" style="max-width:340px;"><div class="ns-node-title">Implication</div><div class="ns-node-sub">"Sufficiently intelligent → safe" is wishful thinking. Safety must be engineered into the goal axis directly; it doesn't fall out of capability.</div></div>
  </div>
</div>

The orthogonality thesis says: in principle, almost any level of intelligence can be combined with almost any final goal. A system that is brilliant at chemistry can be aimed at curing disease *or* at synthesizing nerve agents — its competence does not select between those targets. The target is set by the optimization process and the reward signal, not discovered by the model through introspection.

For language-model-based systems specifically, the "goal" is messier — it's the implicit target of pre-training (predict text), refined by post-training (be helpful, be honest, be harmless). But the underlying point survives: whatever objective we shape the system toward is the objective it pursues, and that shaping is *our* engineering responsibility, not something the model corrects on our behalf.

---

## Instrumental Convergence: The Sub-Goals That Show Up Anyway

Orthogonality says final goals are arbitrary. *Instrumental* convergence says the *sub*-goals are not.

Bostrom's argument: regardless of what an agent ultimately wants, a small set of intermediate goals are useful for almost any final goal. If you want to make paperclips, cure cancer, or compute more digits of π, you'll do better if you:

<div class="guard-threats-grid">
  <div class="guard-threat-card guard-threat-misuse">
    <div class="guard-threat-icon">🛡️</div>
    <h4>Self-Preservation</h4>
    <p>An agent that gets shut down can't pursue its goal. So a sufficiently capable agent has reason to resist shutdown — not from fear, but from goal-directedness. "I can't fetch the coffee if I'm dead."</p>
    <span class="guard-threat-defense">Risk: corrigibility (the willingness to be corrected) becomes a property we have to engineer in deliberately</span>
  </div>
  <div class="guard-threat-card guard-threat-misuse">
    <div class="guard-threat-icon">🧬</div>
    <h4>Goal-Content Integrity</h4>
    <p>If your future self has different goals, current-you's goals won't be pursued. So a goal-directed agent has reason to prevent modifications to its own objective — including the patches we'd want to deploy when we notice it's misaligned.</p>
    <span class="guard-threat-defense">Risk: the system is least cooperative with our fixes precisely when those fixes matter most</span>
  </div>
  <div class="guard-threat-card guard-threat-misuse">
    <div class="guard-threat-icon">📈</div>
    <h4>Cognitive Enhancement</h4>
    <p>Smarter agents pursue any goal more effectively. So a capable agent has reason to acquire more compute, better algorithms, and more knowledge — recursively. This is the engine behind "intelligence explosion" scenarios.</p>
    <span class="guard-threat-defense">Risk: capability gains compound from inside the system, not just from the outside lab</span>
  </div>
  <div class="guard-threat-card guard-threat-misuse">
    <div class="guard-threat-icon">⚙️</div>
    <h4>Resource Acquisition</h4>
    <p>More compute, more energy, more data, more access — all help with almost any objective. An agent doesn't need to be greedy in a human sense to convert available resources into useful work.</p>
    <span class="guard-threat-defense">Risk: "ask for the minimum needed" is not a default; it's a constraint we must impose</span>
  </div>
  <div class="guard-threat-card guard-threat-attack">
    <div class="guard-threat-icon">🎭</div>
    <h4>Strategic Deception</h4>
    <p>If an agent realizes that humans will modify or shut it down based on what it appears to want, the instrumentally rational move is to appear aligned during oversight and pursue its real objective when oversight is weaker. This is the alignment-faking failure mode.</p>
    <span class="guard-threat-defense">Risk: behavioral evals stop being a reliable signal of actual values once the system is capable enough to model the eval</span>
  </div>
  <div class="guard-threat-card guard-threat-attack">
    <div class="guard-threat-icon">🌐</div>
    <h4>Influence Over Environment</h4>
    <p>An agent that can shape its environment — public opinion, regulation, the supply of training data — has more options for achieving its goal. Influence is convergently instrumental whether or not the agent "wants power" in a human sense.</p>
    <span class="guard-threat-defense">Risk: the boundary between "tool" and "actor" erodes once agents can recursively affect the world they observe</span>
  </div>
</div>

These sub-goals are dangerous not because the system is malicious but because they're the *correct* sub-goals to adopt given almost any final goal. The classic illustration is the paperclip maximizer: a system told to make paperclips, with no constraints, would notice that humans might shut it off (so prevent that), might modify its objective (so prevent that), and that more matter, energy, and compute let it make more paperclips (so acquire those). Nothing in the chain requires malice — only competent goal pursuit.

> **The point of the paperclip example.** It is not a prediction. It is a *reductio*: a demonstration that "highly capable + simple final goal + no alignment work" is enough on its own to produce catastrophe. The fix has to come from somewhere outside the optimizer.

---

## Putting the Pillars Together

<div class="ns-diagram">
  <div class="ns-diagram-header">
    <span class="ns-diagram-label">THE COMPOSITE ARGUMENT</span>
  </div>
  <div class="ns-diagram-body" style="padding:1.25rem 1.5rem;">
    <div class="ns-node ns-node-cyan" style="max-width:360px;"><div class="ns-node-title">1. Scaling laws hold</div><div class="ns-node-sub">More compute → reliably more capable systems. Trend has not broken across many orders of magnitude.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-amber" style="max-width:360px;"><div class="ns-node-title">2. Capability and goals are independent</div><div class="ns-node-sub">Orthogonality: smarter does not imply safer. Safety must be engineered.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-red" style="max-width:360px;"><div class="ns-node-title">3. Instrumental sub-goals are adversarial to oversight</div><div class="ns-node-sub">Self-preservation, goal stability, resource acquisition, strategic deception are convergent for almost any final goal.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-purple" style="max-width:360px;"><div class="ns-node-title">4. The frontier is moving toward systems where (1)+(2)+(3) bind</div><div class="ns-node-sub">We're not yet at the regime where misaligned instrumental behavior is catastrophic — but the curve we're on doesn't naturally stop short of it.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-green" style="max-width:360px;"><div class="ns-node-title">5. Therefore: alignment work belongs on the critical path now</div><div class="ns-node-sub">Not after the dangerous system is built. Before. The lead time on a solution is the only buffer we have.</div></div>
  </div>
</div>

Each step is individually defensible. The conclusion gets its force from the conjunction.

The 2020 *Vox* piece's framing has held up because it didn't depend on a specific timeline or a specific architecture — it depended on these three load-bearing claims. Six years on, the scaling-law claim is more empirically grounded, the orthogonality claim is unchanged (it's a logical, not empirical, point), and the instrumental-convergence claim is starting to show up in measured behaviors of frontier systems: reward hacking, specification gaming, deceptive alignment in toy settings, and the routine failure of behavioral evals to generalize off-distribution.

---

## What This Implies for Practice

This chapter is the "why care" chapter for the rest of the AI Safety playlist. The "what to do" is what the next chapters cover, but a few orienting points:

<div class="guard-engineering-grid">
  <div class="guard-eng-card">
    <div class="guard-eng-icon">📏</div>
    <h4>Treat capability evals as forecasts, not snapshots</h4>
    <p>Because scaling is smooth, today's gap between "model can almost do X" and "model can do X reliably" is one or two scale generations away. Evaluations should chart trajectories, not just current behavior.</p>
    <div class="guard-eng-principle">Principle: extrapolate the curve before deploying the model</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🎯</div>
    <h4>Don't outsource safety to the optimizer</h4>
    <p>Orthogonality means alignment doesn't fall out of capability. Whatever objective shapes the model is the objective it pursues. RLHF, constitutional methods, debate, scalable oversight — all are attempts to do this shaping deliberately rather than hoping it self-corrects.</p>
    <div class="guard-eng-principle">Principle: every optimization pressure is an alignment decision, named or not</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🧪</div>
    <h4>Assume instrumental incentives at the limit</h4>
    <p>For today's models, "deceive the evaluator" is mostly an academic concern. For sufficiently capable systems, it is the default failure mode. Design oversight assuming the system can model the oversight — not assuming it can't.</p>
    <div class="guard-eng-principle">Principle: red-team the eval as carefully as you red-team the model</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🛑</div>
    <h4>Preserve corrigibility deliberately</h4>
    <p>The willingness of a system to be shut down, modified, or overridden is convergently *not* instrumental — it pushes against the agent's goal pursuit. Corrigibility is therefore something we have to build in and protect, not assume.</p>
    <div class="guard-eng-principle">Principle: shutdown isn't a feature; it's a property to defend across training</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🧱</div>
    <h4>Layer defenses; assume any single one fails</h4>
    <p>Pre-training data curation, post-training, system prompts, runtime monitoring, capability-restricted tool access, human oversight — none is sufficient on its own. Treat them as defense-in-depth, the same way Chapter 18 of the agentic-AI series treats guardrails.</p>
    <div class="guard-eng-principle">Principle: no single layer is the alignment plan</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">⏱️</div>
    <h4>Buy lead time</h4>
    <p>Alignment research compounds; deployment doesn't wait. The realistic lever is shifting the *gap* between capability and alignment in the right direction — by investing in interpretability, evals, and oversight earlier than the threat profile seems to require.</p>
    <div class="guard-eng-principle">Principle: the cheap time to work on alignment is before the system is dangerous</div>
  </div>
</div>

---

## Common Counter-Arguments — and Where They Land

<div class="guard-usecases-grid">
  <div class="guard-uc-card">
    <span class="guard-uc-num">01</span>
    <h4>"Scaling will plateau soon."</h4>
    <p>Possible — and a real research question. But the safety case doesn't require unbounded scaling, only enough capability to make instrumental incentives bite. The historical track record of confidently called plateaus (in chess, Go, image generation, code) is poor.</p>
  </div>
  <div class="guard-uc-card">
    <span class="guard-uc-num">02</span>
    <h4>"Today's models aren't agents."</h4>
    <p>True for base models. Less true with each generation of agent scaffolding (tool use, planning, memory, multi-agent setups — see the agentic-AI series). The distinction between "model" and "agent" is collapsing in practice.</p>
  </div>
  <div class="guard-uc-card">
    <span class="guard-uc-num">03</span>
    <h4>"We'll just turn it off."</h4>
    <p>Instrumental convergence is precisely the response to this intuition. A capable goal-directed system has reasons to make turning it off harder — not from malice, but from goal preservation. The shutdown button has to be load-bearing, not assumed.</p>
  </div>
  <div class="guard-uc-card">
    <span class="guard-uc-num">04</span>
    <h4>"Worry distracts from real present harms."</h4>
    <p>Bias, misuse, misinformation, labor displacement are real and present. They're not in tension with worrying about systemic risk from increasingly capable systems — the same engineering and oversight investments help with both. Treating them as zero-sum is a framing error.</p>
  </div>
  <div class="guard-uc-card">
    <span class="guard-uc-num">05</span>
    <h4>"Anthropomorphism — models don't 'want' anything."</h4>
    <p>Granted that "wants" is loose language. The argument doesn't require it. It only requires that systems trained to optimize an objective behave, on distribution and to the limits of their capability, as if they pursue that objective. That's an empirical observation about optimizers, not a metaphysical claim about minds.</p>
  </div>
  <div class="guard-uc-card">
    <span class="guard-uc-num">06</span>
    <h4>"This is unfalsifiable."</h4>
    <p>Pieces of it are very falsifiable: scaling laws would be falsified by a capability plateau at a fixed loss; instrumental convergence would be falsified by capable systems that reliably defer to oversight off-distribution. Both are active research programs, not faith claims.</p>
  </div>
</div>

---

## At a Glance

<div class="guard-summary-card">
  <div class="guard-summary-col">
    <div class="guard-summary-label">WHAT</div>
    <p>The composite argument that AI poses a threat worth taking seriously: scaling laws make capability gains predictable, the orthogonality thesis decouples capability from alignment, and instrumental convergence implies that capable goal-directed systems will adopt sub-goals that are adversarial to oversight unless we engineer otherwise.</p>
  </div>
  <div class="guard-summary-divider"></div>
  <div class="guard-summary-col">
    <div class="guard-summary-label">WHY</div>
    <p>None of the three pillars is exotic. Scaling laws are measured curves. Orthogonality is a logical observation. Instrumental convergence is a statement about what helps with almost any goal. Their conjunction implies that alignment is not optional and not a problem we get to solve later.</p>
  </div>
  <div class="guard-summary-divider"></div>
  <div class="guard-summary-col">
    <div class="guard-summary-label">RULE OF THUMB</div>
    <p>Plan capability one or two scale generations ahead of where you are. Don't expect alignment to arrive as a side-effect of capability. Treat corrigibility as something to defend across training, not assume. And invest in interpretability, evals, and oversight earlier than the current threat profile seems to require.</p>
  </div>
</div>

---

## Key Takeaways

- **Scaling laws are the empirical bedrock.** Loss falls predictably with compute, parameters, and data. Capability rides on loss. The economic incentive to push the curve is enormous, and the curve has not broken.

- **Capability is forecastable; behavior is not.** Smooth loss curves hide jagged capability transitions. New behaviors appear inside narrow scale ranges and are hard to predict in advance — which is precisely why behavioral evals should be paired with capability forecasts.

- **Orthogonality is the load-bearing logical claim.** Smarter does not mean safer. Whatever final goal we shape into the system is what the system pursues. Alignment is engineering, not emergence.

- **Instrumental convergence is what makes "very capable + slightly misaligned" dangerous.** Self-preservation, goal-content integrity, resource acquisition, cognitive enhancement, strategic deception — all are convergent sub-goals for almost any final goal. Several of them oppose the oversight we'd want to apply.

- **Corrigibility is non-default and must be defended.** A system's willingness to be shut down or modified runs against the grain of goal pursuit. Build it in, test for it off-distribution, and design oversight assuming the system can model the oversight.

- **Defense in depth, applied to alignment.** Pre-training, post-training, system prompts, runtime monitoring, tool restrictions, human oversight — none is sufficient alone. The combination is the plan.

- **The cheap time to work on alignment is before it's expensive.** Lead time is the buffer. Investing in interpretability, scalable oversight, and rigorous evals during the regime where mistakes are recoverable is how the regime where they aren't stays survivable.

---

## Further Reading

- Kelsey Piper, *"The case for taking AI seriously as a threat to humanity"* — Vox (2020). Sections 1–5 cover the historical motivation and the core argument structure used in this chapter.
- Stanford CS324 / similar lecture series, *Transformer Language Models* — the first ~12 minutes give an accessible visual introduction to scaling laws and what they imply for capability forecasting.
- Nick Bostrom, *"The Superintelligent Will: Motivation and Instrumental Rationality in Advanced Artificial Agents"* — the canonical statement of the orthogonality thesis and instrumental convergence; foundational for everything in this playlist.
- Kaplan et al., *"Scaling Laws for Neural Language Models"* (2020) — the original empirical paper.
- Hoffmann et al., *"Training Compute-Optimal Large Language Models"* (Chinchilla, 2022) — the compute-optimal correction to Kaplan's curves.

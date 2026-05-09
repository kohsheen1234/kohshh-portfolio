---
layout: post
title: "Chapter 5: AI Governance — Approval Regulation, Technical Levers, and the Coordination Problem"
description: "Alignment is what you build into the model. Governance is the institutional scaffolding that decides which models get built, who gets to run them, and what evidence we demand before they ship. This chapter walks through the technical AI governance toolkit and the FDA-style approval-regulation proposal."
tags: ai-safety governance regulation compute-governance evaluations rsp
date: 2026-01-14
featured: true
author: Kohsheen Tiku
toc: true
mermaid:
  enabled: true
  zoomable: true
---

## Why Governance Belongs in an AI Safety Series

Chapters 1–4 of this playlist were about what's true *inside* an AI system — its capability, its objective, its internal cognition, and its security posture. None of those, on their own, decide whether a particular system gets built, who gets to run it, what evidence has to exist before it ships, or what happens when the evidence is bad.

Those decisions are governance. And governance is where the technical case for AI safety stops being a research program and starts being something the world actually has to do something about.

Two pieces of context to set this chapter:

1. **Governance is multi-stakeholder by construction.** No single lab, regulator, or country can implement the governance described below unilaterally — and the moment one tries, the value of unilateral action becomes a function of whether others follow. That's the coordination problem, and it's load-bearing.
2. **There is a *technical* side to AI governance.** Governance isn't only law and policy. It also includes the technical instruments that make policy enforceable: evaluations, audits, compute monitoring, structured access, watermarking, model registries, incident reporting. Reuel et al.'s *Open Problems in Technical AI Governance* (2024) is the field map for this side.

This chapter is structured around three layers — the *technical toolkit*, the *regulatory architecture* (with a deep dive on Ezell's approval-regulation proposal), and the *coordination problem* — and ends with what each implies for engineers, lab leadership, and policymakers.

<div class="concept-box">
  <span class="concept-label">Before You Start — Key Terms Explained</span>
  <p><strong>AI governance:</strong> The institutional, regulatory, and technical mechanisms that determine which AI systems get developed, who gets to develop and deploy them, what conditions they must satisfy, and what consequences attach to failure.</p>
  <p style="margin-top:0.5rem"><strong>Technical AI governance (TAIG):</strong> The subset of governance that requires technical work to be implementable — evaluations, audit infrastructure, compute monitoring, watermarking, structured-access tooling, model registries. Reuel et al.'s framing.</p>
  <p style="margin-top:0.5rem"><strong>Approval regulation:</strong> A regulatory regime where a product cannot be deployed (or in stronger forms, developed) until a regulator pre-certifies it as safe. The FDA model for pharmaceuticals is the canonical example. Ezell's <em>Certified Safe</em> proposal applies the schematic to frontier AI.</p>
  <p style="margin-top:0.5rem"><strong>Frontier AI:</strong> The most capable general-purpose AI systems at any given time — typically the largest training runs, the most capable foundation models, the systems whose deployment risks are not yet well-characterized. The category the heaviest governance attention focuses on.</p>
  <p style="margin-top:0.5rem"><strong>Responsible Scaling Policy (RSP) / If-Then commitment:</strong> A voluntary framework — pioneered by Anthropic, adopted in similar form by OpenAI's Preparedness Framework, Google DeepMind's Frontier Safety Framework, and others — committing a developer to specific safety thresholds tied to capability evaluations, with pre-committed responses if those thresholds are crossed.</p>
  <p style="margin-top:0.5rem"><strong>Compute governance:</strong> Using control of AI training and inference compute as a regulatory lever — through chip export controls, training-run disclosure thresholds, datacenter monitoring, or hardware-based mechanisms. The argument is that compute is more identifiable, more concentrated, and more controllable than weights or data.</p>
  <p style="margin-top:0.5rem"><strong>Structured access:</strong> Granting researchers, auditors, or regulators specific, controlled forms of access to a model — API access with elevated permissions, tiered access to weights, sandboxed inspection environments — without simply releasing weights publicly.</p>
  <p style="margin-top:0.5rem"><strong>Evaluations (evals):</strong> Standardized tests probing a model's capabilities and propensities. Capability evals (can the model do X?) and propensity evals (will it do X under certain conditions?) are both governance-relevant.</p>
</div>

---

## The Three Layers of AI Governance

<div class="ns-diagram">
  <div class="ns-diagram-header">
    <span class="ns-diagram-label">GOVERNANCE STACK — TOOLS, ARCHITECTURE, COORDINATION</span>
  </div>
  <div class="ns-diagram-body" style="padding:1.25rem 1.5rem;">
    <div class="ns-node ns-node-cyan" style="max-width:360px;"><div class="ns-node-title">Layer 1 — Technical AI Governance</div><div class="ns-node-sub">The instruments: evaluations, audits, compute monitoring, watermarking, registries, incident reporting. Without these, governance has nothing to inspect or verify.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-amber" style="max-width:360px;"><div class="ns-node-title">Layer 2 — Regulatory Architecture</div><div class="ns-node-sub">How decisions get made and enforced: voluntary RSPs, sector-specific rules, horizontal frameworks (EU AI Act), approval regulation (Ezell's <em>Certified Safe</em>), liability regimes.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-red" style="max-width:360px;"><div class="ns-node-title">Layer 3 — International Coordination</div><div class="ns-node-sub">The problem that none of the above is sufficient if frontier capability can simply move to a less-regulated jurisdiction. Treaties, export controls, AI Safety Institutes, lab agreements all live here.</div></div>
  </div>
</div>

The layers are mutually dependent. Approval regulation without evaluations is a rubber stamp. Evaluations without an institutional consumer are an academic exercise. International coordination without enforceable domestic regimes is a press release. Each chapter section needs the others to be load-bearing.

---

## Layer 1: Technical AI Governance — The Toolkit

Reuel et al.'s 2024 *Open Problems in Technical AI Governance* is the cleanest taxonomy of what's actually needed to make any of this implementable. The central observation: **almost every plausible AI governance regime depends on technical capabilities that don't currently exist at the required level of reliability.** Building those capabilities is its own research program, sitting between ML and policy.

The toolkit, organized:

<div class="guard-threats-grid">
  <div class="guard-threat-card guard-threat-misuse">
    <div class="guard-threat-icon">📋</div>
    <h4>Capability & Propensity Evaluations</h4>
    <p>The core question for governance: <em>what can this system do, and what will it do?</em> Cyberweapon uplift evals, biothreat-knowledge evals, autonomous-replication evals, persuasion evals. Reliable, reproducible, hard to game. Eval design is a nontrivial research problem with active failure modes (sandbagging, eval-aware behavior, narrow generalization).</p>
    <span class="guard-threat-defense">Open: how do you eval a model that may know it's being evaluated?</span>
  </div>
  <div class="guard-threat-card guard-threat-misuse">
    <div class="guard-threat-icon">🔍</div>
    <h4>Auditing & Structured Access</h4>
    <p>Third parties — regulators, civil-society auditors, AI Safety Institutes — need access that's deeper than an API but less than weight release. Tiered access, sandboxed inspection environments, audit modes that disable certain output filters for compliance testing. Each tier has its own security model.</p>
    <span class="guard-threat-defense">Open: how do you give auditors enough to do their job without leaking weights?</span>
  </div>
  <div class="guard-threat-card guard-threat-misuse">
    <div class="guard-threat-icon">🖥️</div>
    <h4>Compute Governance</h4>
    <p>The Sastry et al. argument: compute is more <em>governable</em> than data or weights. There are few suppliers, finite high-end accelerators, and natural disclosure thresholds (training runs above N FLOPs). Mechanisms: export controls, chip-level cryptographic attestation, training-run reporting, datacenter monitoring.</p>
    <span class="guard-threat-defense">Open: hardware mechanisms that survive a determined adversary, not just well-meaning operators</span>
  </div>
  <div class="guard-threat-card guard-threat-misuse">
    <div class="guard-threat-icon">🪪</div>
    <h4>Provenance & Watermarking</h4>
    <p>Tooling to identify whether a given piece of content came from a particular model, and which model. Output watermarking, content credentials (C2PA), model fingerprinting. Critical for impersonation, election integrity, CSAM detection — and limited by detector reliability, removability under transformations, and the existence of unmarked open-weight competitors.</p>
    <span class="guard-threat-defense">Open: any robust watermark must survive paraphrase, translation, and partial copy</span>
  </div>
  <div class="guard-threat-card guard-threat-attack">
    <div class="guard-threat-icon">📑</div>
    <h4>Model Registries & Disclosure</h4>
    <p>A registry of frontier models with metadata: training compute, training-data sources, evaluation results, deployment surface, incident history. Currently mostly voluntary (e.g. EU AI Act's GPAI register). A working registry is a precondition for almost every other governance action.</p>
    <span class="guard-threat-defense">Open: what disclosure is mandated, what is voluntary, what is publicly viewable vs. regulator-only</span>
  </div>
  <div class="guard-threat-card guard-threat-attack">
    <div class="guard-threat-icon">🚨</div>
    <h4>Incident Reporting & Post-Market Surveillance</h4>
    <p>Aviation has the FAA mandatory-reporting regime; medicine has FDA adverse-event reporting. AI has, mostly, ad-hoc voluntary disclosure. Building MITRE-style shared incident databases (MITRE ATLAS, OECD AI Incident Database) is a precondition to learning from failures across organizations.</p>
    <span class="guard-threat-defense">Open: what counts as a reportable incident; how to share without leaking IP or attack details</span>
  </div>
</div>

> **Why "open problems" is the right framing.** Reuel et al. don't claim these tools exist and just need adopting. They claim each tool has technical research questions blocking its production use — and that without that research, governance regimes will either be unenforceable or rely on developers' good faith. The *technical* AI governance program is precisely the work of closing those gaps.

The implication for an engineer reading this: **a lot of the highest-leverage governance work is engineering, not law.** Better evals, better watermarks, better attestation primitives, better incident schemas. The supply of these is a binding constraint on every regulatory regime that depends on them.

---

## Layer 2: Regulatory Architecture — Five Live Models

The instruments above can be assembled into very different regulatory architectures. Roughly five families are active in 2026.

<div class="guard-engineering-grid">
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🤝</div>
    <h4>Voluntary RSPs / If-Then Commitments</h4>
    <p>Developers publish capability thresholds and commit to specific responses if those thresholds are crossed. Anthropic's RSP, OpenAI's Preparedness Framework, Google DeepMind's Frontier Safety Framework. Pros: fast, evolves with the technology. Cons: voluntary; competitive pressure can erode commitments; verification is mostly self-reported.</p>
    <div class="guard-eng-principle">Niche: bridge regime — a stand-in for hard regulation while standards develop</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">⚖️</div>
    <h4>Horizontal Frameworks (EU AI Act)</h4>
    <p>Risk-tiered, sector-agnostic regulation: prohibited uses, high-risk obligations, limited-risk transparency, GPAI rules. Emphasizes documentation, conformity assessment, fundamental-rights impact assessment. Pros: democratically legitimate, enforceable. Cons: slow to update, struggles with frontier-AI-specific risks not covered by general categories.</p>
    <div class="guard-eng-principle">Niche: backbone domestic regulation, with frontier issues handled separately</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🏥</div>
    <h4>Approval Regulation (Ezell's <em>Certified Safe</em>)</h4>
    <p>Pre-deployment regulator approval for frontier systems: developer submits safety case, regulator reviews, decision is binding. Modeled on FDA. Pros: strong, evidence-grounded gating; established mature mechanisms in pharma. Cons: requires institutional capacity that doesn't yet exist for AI; risk of regulatory capture; speed concerns.</p>
    <div class="guard-eng-principle">Niche: highest-stakes systems where pre-market evidence is critical</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🔧</div>
    <h4>Sector-Specific Rules</h4>
    <p>Specific regulators for specific deployment domains — FDA for clinical AI, NHTSA for self-driving, SEC for AI-driven trading, EEOC for hiring. Pros: leverages domain expertise. Cons: foundation-model risks span sectors; horizontal gaps remain.</p>
    <div class="guard-eng-principle">Niche: deployment-side regulation where sectoral expertise dominates</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">⚖️</div>
    <h4>Liability & Tort</h4>
    <p>Common-law and statutory liability for harms caused by AI systems. Pros: works without new agencies; market-driven incentive for safety. Cons: notoriously slow signal; difficult causation cases; insufficient for catastrophic harms (who do you sue after a global incident?). Best as a complement, not a substitute.</p>
    <div class="guard-eng-principle">Niche: backstop for downstream harms; insufficient alone for systemic risk</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🌐</div>
    <h4>Compute / Export Controls</h4>
    <p>The U.S. CHIPS Act and successor controls treat advanced semiconductor manufacturing and high-end AI accelerators as strategic goods. Pros: bites on a chokepoint; few suppliers, identifiable shipments. Cons: regulates an upstream input rather than the model itself; geopolitical dependency.</p>
    <div class="guard-eng-principle">Niche: upstream pressure on the cost/availability of frontier-scale compute</div>
  </div>
</div>

These aren't mutually exclusive — most realistic regimes blend several. The interesting design question is *which combination*, and the answer depends on the maturity of the underlying technical instruments (Layer 1) and the political appetite for binding rules (Layer 3).

---

## Deep Dive: Approval Regulation — Ezell's *Certified Safe*

Carson Ezell's *Certified Safe: A Schematic for Approval Regulation of Frontier AI* is the most fully-worked-out proposal in the family. It deserves a careful walk-through because the structure illuminates *what governance has to be able to do*, not just what it would forbid.

The core proposal: **frontier AI systems above defined thresholds must obtain regulator approval before deployment**, and in stronger versions before development past a certain point. The schematic specifies who, what, and how.

<div class="ns-diagram">
  <div class="ns-diagram-header">
    <span class="ns-diagram-label">CERTIFIED SAFE — THE SCHEMATIC</span>
  </div>
  <div class="ns-diagram-body" style="padding:1.25rem 1.5rem;">
    <div class="ns-node ns-node-cyan" style="max-width:360px;"><div class="ns-node-title">1. Define the regulated class</div><div class="ns-node-sub">Threshold criteria — training compute (e.g. > 10^26 FLOPs), capability benchmarks, deployment scale. Below the threshold: light-touch / sectoral. Above: in scope of approval regulation.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node" style="max-width:360px;"><div class="ns-node-title">2. Developer prepares safety case</div><div class="ns-node-sub">A structured argument — not a checklist — that the system is safe enough for the proposed deployment. Includes capability evals, propensity evals, mitigations, residual risks, deployment-context evidence.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-amber" style="max-width:360px;"><div class="ns-node-title">3. Independent review</div><div class="ns-node-sub">Regulator (and/or accredited third-party auditors) assesses the safety case. May require additional evaluations, structured access for inspection, or revisions. Decision-making process is itself transparent.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-purple" style="max-width:360px;"><div class="ns-node-title">4. Conditional approval</div><div class="ns-node-sub">Approval is for a defined deployment scope: which use cases, which user populations, which risk-mitigation measures must remain in place. Substantial changes trigger re-review.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-red" style="max-width:360px;"><div class="ns-node-title">5. Post-market surveillance</div><div class="ns-node-sub">Mandatory incident reporting, scheduled re-evaluations, ability to withdraw approval if new evidence emerges. Approval is a continuing relationship, not a one-time stamp.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-green" style="max-width:360px;"><div class="ns-node-title">6. Enforcement</div><div class="ns-node-sub">Penalties for unapproved deployment. Authority to halt or recall systems where harm is identified. Liability shield for approved-and-compliant deployment that fails despite good faith.</div></div>
  </div>
</div>

The pharma analogy isn't decorative — it's load-bearing. FDA approval works (imperfectly) because:

- The agency is technically credible.
- The submission package (the "NDA" in FDA-speak, or "safety case" in AI) is structured, auditable, and explicit about evidence and uncertainty.
- The regulatory decision is binding, and there are real consequences for circumvention.
- Approval is for a defined indication, not the molecule in general.
- Post-market surveillance is mandatory and consequential.

Ezell's claim is that the same five properties are achievable for AI — and that without something close to them, the alternative regimes leave the most consequential decisions in the hands of the developers themselves. The strength of the proposal is that it forces governance to confront *what evidence would be sufficient to deploy a frontier system* — and that question, once asked seriously, exposes how much technical AI governance work still has to be done before any regulator could answer it.

### What approval regulation requires that doesn't yet exist

The honest reading of *Certified Safe* is that it's a target, not a current capability. The preconditions are exactly the open problems Reuel et al. identified:

<div class="guard-threats-grid">
  <div class="guard-threat-card guard-threat-attack">
    <div class="guard-threat-icon">📐</div>
    <h4>Mature evaluations</h4>
    <p>The regulator needs evals it trusts as evidence — reproducible, robust to gaming, calibrated to real-world risk. Today, most safety evals are noisy and contested. A mature eval ecosystem is years of work.</p>
    <span class="guard-threat-defense">Required: reproducible, gameable-resistant capability and propensity evals</span>
  </div>
  <div class="guard-threat-card guard-threat-attack">
    <div class="guard-threat-icon">🏛️</div>
    <h4>Institutional capacity</h4>
    <p>An approving body needs technical depth, secure facilities for structured access, statutory authority, and political legitimacy. AI Safety Institutes (UK, US, Japan, etc.) are the early prototypes; they're nowhere near FDA-scale yet.</p>
    <span class="guard-threat-defense">Required: agencies with deep ML expertise and binding authority</span>
  </div>
  <div class="guard-threat-card guard-threat-attack">
    <div class="guard-threat-icon">🧪</div>
    <h4>Safety case methodology</h4>
    <p>What's a good safety case for a frontier model? The aviation and nuclear-safety communities have decades of practice with structured safety cases (e.g. GSN). The AI community is just starting to write them — and the right structure for a foundation model is still under active development.</p>
    <span class="guard-threat-defense">Required: standardized structures for arguing AI safety, audit-ready</span>
  </div>
  <div class="guard-threat-card guard-threat-attack">
    <div class="guard-threat-icon">🌐</div>
    <h4>Cross-jurisdictional coherence</h4>
    <p>If only one country has approval regulation, frontier development moves elsewhere. If many countries each have different regimes, compliance overhead is unsustainable. The proposal needs international harmonization to be enforceable, which lands us in Layer 3.</p>
    <span class="guard-threat-defense">Required: bilateral/multilateral recognition or a central international body</span>
  </div>
</div>

> **The honest summary of where approval regulation stands.** It is the most coherent end-state proposal for the highest-stakes systems. It is also currently impossible to implement at full strength because the technical and institutional preconditions don't exist yet. The realistic path is *building those preconditions in parallel with bridging regimes* — voluntary RSPs, AI Safety Institutes, sector-specific rules — that buy time to mature the toolkit.

---

## Layer 3: The Coordination Problem

Domestic regulation has one fundamental limit: it doesn't bind anyone outside the jurisdiction. For frontier AI, where the marginal cost of moving compute and talent across borders is non-trivial but finite, that limit is load-bearing.

<div class="ns-diagram">
  <div class="ns-diagram-header">
    <span class="ns-diagram-label">THE COORDINATION GAME</span>
  </div>
  <div class="ns-diagram-body" style="padding:1.25rem 1.5rem;">
    <div class="ns-node ns-node-cyan" style="max-width:360px;"><div class="ns-node-title">Best-case: cooperation</div><div class="ns-node-sub">All major developers and jurisdictions adopt similar safety standards. No race to the bottom. Trust is high enough that information sharing on incidents is fast.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-amber" style="max-width:360px;"><div class="ns-node-title">Default: partial cooperation</div><div class="ns-node-sub">U.S., U.K., EU, Japan converge approximately. China, Russia, and unaligned actors operate under different regimes. Frontier capability still concentrated, but with parallel tracks.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-red" style="max-width:360px;"><div class="ns-node-title">Worst-case: race</div><div class="ns-node-sub">Unilateral safety commitments seen as competitive disadvantage. Regimes diverge. Capability migrates to lowest-regulation jurisdiction. Domestic safety standards have nothing to attach to.</div></div>
  </div>
</div>

The instruments for cross-border coordination on AI are still early-stage:

<div class="guard-engineering-grid">
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🏛️</div>
    <h4>AI Safety Institutes Network</h4>
    <p>UK AISI (founded 2023), US AISI (2024), and counterparts in Japan, Singapore, Korea, Canada, and the EU. Coordinate on evaluations, share methodologies, conduct pre-deployment testing. The closest thing to an embryonic international technical governance regime.</p>
    <div class="guard-eng-principle">Open: how to harden methodology coordination into binding mutual recognition</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">📜</div>
    <h4>International Statements & Declarations</h4>
    <p>Bletchley Declaration (2023), Seoul Declaration (2024), and successor summits. Soft law: aspirational commitments, not enforcement. Important as norm-setting, weak as binding constraint. The G7 Hiroshima AI Process Code of Conduct sits in similar territory.</p>
    <div class="guard-eng-principle">Open: pathway from declaratory norms to binding commitments</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🚢</div>
    <h4>Export Controls & Technology Transfer</h4>
    <p>U.S. controls on advanced GPU exports (October 2022 onward, repeatedly tightened) and on associated semiconductor manufacturing equipment. Effective as a one-sided lever; effectiveness depends on multilateral participation (Netherlands, Japan in semiconductor equipment) and on smuggling/circumvention.</p>
    <div class="guard-eng-principle">Open: coupling export controls with downstream-use commitments</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🤝</div>
    <h4>Lab-to-Lab Agreements</h4>
    <p>Voluntary multi-party commitments: Frontier Model Forum, the White House voluntary commitments (2023), pre-deployment testing agreements with AISIs. Faster than treaty-making, weaker as binding commitment, useful as a substrate to build on.</p>
    <div class="guard-eng-principle">Open: turning informal lab agreements into auditable commitments</div>
  </div>
</div>

> **Why this matters for the technical layer.** Almost every Layer 1 instrument is more useful if it works across borders — a safety eval whose results are mutually recognized, an incident database that aggregates across jurisdictions, a model registry with international scope, watermarking that's recognized cross-platform. The technical work isn't separate from the international coordination work; it's the substrate that makes coordination implementable.

---

## What This Implies for Practice

<div class="guard-engineering-grid">
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🔧</div>
    <h4>Engineers: TAIG is engineering work</h4>
    <p>If you're an ML engineer who cares about safety, "build better evaluations," "improve audit infrastructure," "implement structured-access tooling" are governance contributions in technical clothing. The supply of these is a binding constraint on the rest of governance.</p>
    <div class="guard-eng-principle">Principle: governance has technical preconditions; meet them</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🏢</div>
    <h4>Lab leadership: take RSPs seriously</h4>
    <p>Voluntary frameworks are the bridge regime. They are also the regime that's currently load-bearing, in the absence of statutory approval regulation. The credibility of voluntary frameworks now is a precondition for hard regulation later — both as proof-of-concept and as a base of practice for regulators to adopt.</p>
    <div class="guard-eng-principle">Principle: voluntary commitments today shape mandatory rules tomorrow</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">📜</div>
    <h4>Policymakers: build the institutions before you need them</h4>
    <p>An FDA-style regime takes a generation to mature. The realistic move is to begin building AISIs, model registries, incident-reporting infrastructure, and structured-access frameworks now — even at modest scale — so the institutions exist when the political moment for mandatory regulation arrives.</p>
    <div class="guard-eng-principle">Principle: institutional capacity is the rate-limiting step</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🌐</div>
    <h4>Plan for partial cooperation, not full</h4>
    <p>The realistic governance regime in 2030 is heterogeneous: a U.S./U.K./EU/Japan/Korea bloc converging on aligned standards, others operating under different rules. Design domestic regimes that work in that world — with export controls, structured-access denials, and import restrictions filling the gap left by non-participating jurisdictions.</p>
    <div class="guard-eng-principle">Principle: full multilateralism is a target; resilient partial regimes are the plan</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🧪</div>
    <h4>Treat safety cases as a discipline</h4>
    <p>The aviation and nuclear communities have decades of practice with structured safety cases. Borrow the discipline: explicit hazard identification, evidence-based mitigation arguments, residual-risk acknowledgement, audit-ready documentation. This is true whether or not it's mandated yet.</p>
    <div class="guard-eng-principle">Principle: write the safety case you'd want a regulator to read</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🚨</div>
    <h4>Report incidents — and learn from them</h4>
    <p>The single biggest difference between AI and other safety-critical fields is the absence of disciplined, shared incident reporting. Voluntary disclosure to MITRE ATLAS, OECD AI Incident Database, AISI safety teams is currently the substitute. Use it. Build the muscle now.</p>
    <div class="guard-eng-principle">Principle: shared incident data is how every safety field improved</div>
  </div>
</div>

---

## Common Confusions

<div class="guard-usecases-grid">
  <div class="guard-uc-card">
    <span class="guard-uc-num">01</span>
    <h4>"Regulation will kill innovation."</h4>
    <p>Empirically, in pharma, aviation, and finance, the relationship between regulation and innovation is more nuanced — predictability and a clear path to market often *enable* investment. The relevant policy question isn't regulation vs. no regulation; it's which regulatory architecture, with what costs and what benefits.</p>
  </div>
  <div class="guard-uc-card">
    <span class="guard-uc-num">02</span>
    <h4>"Voluntary commitments are just PR."</h4>
    <p>Sometimes. Sometimes not — Anthropic's RSP, OpenAI's Preparedness Framework, and DeepMind's Frontier Safety Framework have triggered actual development and deployment changes. Voluntary commitments are auditable in the limited sense that public commitments create reputational and legal exposure when broken. They aren't sufficient; they aren't nothing.</p>
  </div>
  <div class="guard-uc-card">
    <span class="guard-uc-num">03</span>
    <h4>"China won't comply, so why bother?"</h4>
    <p>The U.S. didn't decline nuclear safety regulation because the USSR existed. Domestic safety regimes provide protection against domestic misuse, set norms, and create the institutional substrate for whatever international coordination later becomes possible. Unilateral safety is positive-value even without universal participation.</p>
  </div>
  <div class="guard-uc-card">
    <span class="guard-uc-num">04</span>
    <h4>"Compute governance won't survive smuggling."</h4>
    <p>Export controls leak. They also raise costs, slow timelines, and force adversaries to allocate effort to circumvention. The bar is "do the controls bite enough to matter," not "are they hermetic." Pharma anti-counterfeiting regimes leak too; that doesn't mean you abandon them.</p>
  </div>
  <div class="guard-uc-card">
    <span class="guard-uc-num">05</span>
    <h4>"Approval regulation is too slow for AI."</h4>
    <p>Speed is a design choice. FDA has fast-track and breakthrough designations. Approval regulation can be designed to be faster than vanilla pharma without abandoning the structure. Speed-vs.-rigor is a real tradeoff, but not a binary.</p>
  </div>
  <div class="guard-uc-card">
    <span class="guard-uc-num">06</span>
    <h4>"Safety evaluations are just security theater."</h4>
    <p>Sometimes — when they're poorly designed or developer-self-reported with no audit. The fix is better evaluation methodology and independent inspection, not abandoning evals. The whole point of TAIG is to push evals from theater to evidence.</p>
  </div>
</div>

---

## At a Glance

<div class="guard-summary-card">
  <div class="guard-summary-col">
    <div class="guard-summary-label">WHAT</div>
    <p>AI governance is the institutional, regulatory, and technical scaffolding that determines which AI systems get built, who runs them, and what evidence has to exist before they ship. It has three layers: technical instruments (evals, audits, compute monitoring, watermarking, registries), regulatory architecture (voluntary RSPs, horizontal frameworks, approval regulation, sectoral rules, liability, export controls), and international coordination.</p>
  </div>
  <div class="guard-summary-divider"></div>
  <div class="guard-summary-col">
    <div class="guard-summary-label">WHY</div>
    <p>Alignment work inside a model isn't sufficient if anyone can build any model and deploy it however they want. Governance is what ties capability decisions to evidence and accountability. The Reuel et al. open-problems framing makes the technical preconditions visible. Ezell's <em>Certified Safe</em> proposal makes the regulatory end-state concrete. The coordination problem makes the international layer load-bearing.</p>
  </div>
  <div class="guard-summary-divider"></div>
  <div class="guard-summary-col">
    <div class="guard-summary-label">RULE OF THUMB</div>
    <p>Build the technical instruments now — they're the binding constraint on every regulatory regime. Treat voluntary RSPs as a bridge to mandatory regimes, not an alternative. Plan for partial international cooperation, not full. Borrow safety-case discipline from aviation and nuclear. And report incidents — shared data is how every safety field actually improves.</p>
  </div>
</div>

---

## Key Takeaways

- **Three layers, mutually dependent.** Technical instruments enable regulatory architecture; regulatory architecture is undercut by lack of international coordination; international coordination has nothing to enforce without domestic instruments. Move on all three or move on none.

- **Technical AI governance is the rate-limiting step.** Reliable evaluations, structured access, compute attestation, watermarking, model registries, incident reporting — every governance regime depends on these. Most don't yet exist at the level of reliability needed. Building them is engineering work disguised as policy work.

- **Voluntary RSPs are the current bridge regime.** They're imperfect — voluntary, self-reported, vulnerable to competitive pressure. They're also the only thing currently load-bearing in the absence of mature approval regulation. Their credibility now shapes the rules later.

- **Approval regulation is the most coherent end-state for high-stakes systems.** Ezell's *Certified Safe* schematic — pre-deployment safety case, independent review, conditional approval, post-market surveillance, real enforcement — generalizes a regime that's worked imperfectly-but-consequentially in pharma. The preconditions don't yet exist; the proposal is a target, with TAIG as the runway.

- **Compute governance bites on a real chokepoint.** High-end accelerators and the equipment to make them are concentrated, identifiable, and controllable in ways that data and weights aren't. Export controls, training-run reporting, and chip-level attestation are the toolset.

- **The coordination problem is real and partial cooperation is the realistic plan.** Full multilateralism is a target, not a base case. Domestic regimes that survive partial international participation — backed by export controls, structured-access denials, and import restrictions — are what's actually achievable in the medium term.

- **Engineers are governance contributors.** The TAIG agenda is not separate from ML research — it's an applied subset of it. Better evals, better audits, better attestation primitives are policy infrastructure built in code.

- **Borrow ruthlessly from older safety fields.** Aviation, nuclear, and pharma all developed structured safety cases, mandatory incident reporting, regulator capacity, and international coordination over decades. AI doesn't have decades. It does have the option to copy what worked rather than invent from scratch.

---

## Further Reading

- Reuel, Bucknall, Casper, Fist, Soder et al., *"Open Problems in Technical AI Governance"* (2024) — the field map for the technical instruments side of governance.
- Ezell, *"Certified Safe: A Schematic for Approval Regulation of Frontier AI"* — the most fully-developed proposal for FDA-style pre-deployment AI regulation.
- Sastry, Heim, Belfield, Anderljung et al., *"Computing Power and the Governance of Artificial Intelligence"* (2024) — the canonical case for compute as a governance lever.
- Anthropic, *"Responsible Scaling Policy"*; OpenAI, *"Preparedness Framework"*; Google DeepMind, *"Frontier Safety Framework"* — the reference implementations of voluntary if-then commitments.
- EU AI Act (Regulation 2024/1689) — the most comprehensive horizontal framework, with general-purpose-AI specific obligations.
- UK AI Safety Institute and US AI Safety Institute publications — the early operational record of pre-deployment evaluation regimes.
- OECD AI Incident Monitor and MITRE ATLAS — the early infrastructure for cross-organization incident sharing.

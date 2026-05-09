---
layout: post
title: "Chapter 10: Contributing to AI Safety — Paths, Skills, and Getting Started"
description: "The hardest part of contributing to AI safety isn't picking the right research direction — it's picking a route into the field that matches your background and timeline. This chapter is the field map for that decision."
tags: ai-safety careers fellowships research-engineering policy contribution
date: 2026-04-15
featured: true
author: Kohsheen Tiku
toc: true
mermaid:
  enabled: true
  zoomable: true
---

## Why a Career-Path Chapter

The previous nine chapters laid out *what* AI safety is — the technical case, the alignment portfolio, the security surface, the governance architecture, the evaluation discipline, the control paradigm, and the strongest critiques. This chapter answers a different question:

> **Given all of that, how do you actually contribute?**

The answer isn't a single path. AI safety is a young field with several distinct routes in — research, engineering, policy, evaluation, independent research, advocacy. Each route has different background requirements, different day-to-day work, different organisations to apply to, and different ways of making real impact.

The structure of this chapter:

1. **Roles and routes** — the live categories of work in AI safety as of 2026, with what each actually involves day-to-day.
2. **Where the work happens** — frontier labs, AI Safety Institutes, evaluation orgs, governance organisations, independent research, academia.
3. **Fellowships and structured programs** — the on-ramps that let you trial-run a direction before committing.
4. **Skill stacks by route** — what to build if you're targeting research vs. engineering vs. policy.
5. **The 1-pager / project proposal exercise** — a standard exercise that forces you to make a concrete plan.
6. **Common failure modes** — the ways people new to the field accidentally waste their first six months.

This is more practical and less theoretical than previous chapters. The intent is for you to leave with a concrete next-step list, not a philosophical disposition.

<div class="concept-box">
  <span class="concept-label">Before You Start — Key Terms Explained</span>
  <p><strong>Frontier lab:</strong> The major commercial developers of frontier AI — Anthropic, OpenAI, Google DeepMind, xAI, Meta, plus a handful of others. Each has internal safety, alignment, and security teams.</p>
  <p style="margin-top:0.5rem"><strong>AI Safety Institute (AISI):</strong> Government bodies established to evaluate frontier AI for public-interest safety. UK AISI (founded 2023), US AISI (2024), with counterparts in Japan, Singapore, Korea, Canada, and the EU. Hire from a mix of ML, policy, and security backgrounds.</p>
  <p style="margin-top:0.5rem"><strong>Evaluation organisation:</strong> Non-profits and small labs whose primary work is independent AI capability and safety evaluation. METR, Apollo Research, Redwood Research, MITRE ATLAS, and others.</p>
  <p style="margin-top:0.5rem"><strong>Governance organisation:</strong> Think tanks and policy shops working on AI policy: GovAI, RAND, CSET, IAPS, AI Now Institute, plus academic centres at Oxford, Cambridge, Stanford, etc.</p>
  <p style="margin-top:0.5rem"><strong>Independent / Distillation researcher:</strong> Individuals working outside formal institutions, supported by grants (Open Phil, Survival & Flourishing Fund, LTFF) or fellowships. Often write on Alignment Forum, LessWrong, or in self-published reports.</p>
  <p style="margin-top:0.5rem"><strong>MATS:</strong> ML Alignment & Theory Scholars program — ~3-month research fellowship pairing scholars with active alignment researchers as mentors. One of the most-respected on-ramps for technical research.</p>
  <p style="margin-top:0.5rem"><strong>ARENA:</strong> Alignment Research Engineer Accelerator — ~6-week intensive program for ML engineering with an alignment focus. Practical, project-driven.</p>
  <p style="margin-top:0.5rem"><strong>1-pager:</strong> A standard exercise used by many fellowship and research programs: write a single-page document describing a specific contribution you intend to make — the problem, your approach, the artifact, the impact. Forces concreteness.</p>
</div>

---

## The Roles — What People Actually Do

There are six distinct kinds of work, with different day-to-day rhythms and different paths in.

<div class="guard-engineering-grid">
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🔬</div>
    <h4>1. Alignment Research</h4>
    <p>Frontier research on the alignment problem — interpretability, scalable oversight, agent foundations, RLHF and successors, control. Typical day: experiments on a model, paper writing, internal review, occasional external collaboration. Output: papers, internal research notes, sometimes deployable techniques.</p>
    <div class="guard-eng-principle">Where: Anthropic, OpenAI, GDM, MIRI, Redwood, ARC, Apollo, academia</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🔧</div>
    <h4>2. Research Engineering</h4>
    <p>Building the infrastructure that makes research possible — eval harnesses, training pipelines, interpretability tooling, agent scaffolding. Often the bottleneck for research progress. Day: ML engineering, with safety as the application domain. Output: codebases, deployed systems, internal tooling.</p>
    <div class="guard-eng-principle">Where: every safety-relevant lab and eval org has REs; often the easiest route in</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🧪</div>
    <h4>3. Evaluations / Red-Teaming</h4>
    <p>Designing and running evals on frontier models. The science-of-evals craft from Ch. 8 in practice. Day: building threat models, writing eval scripts, analysing results, working with developers on findings. Output: eval suites, evaluation reports, system-card contributions.</p>
    <div class="guard-eng-principle">Where: METR, Apollo, AISIs, internal lab safety teams, MITRE ATLAS</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🏛️</div>
    <h4>4. Policy / Governance</h4>
    <p>Translating technical AI realities into policy proposals, legal frameworks, and standards. Day: writing policy briefs, engaging regulators, technical advising for legislation, comparative analysis of regimes. Output: policy papers, regulatory comments, draft standards, briefings.</p>
    <div class="guard-eng-principle">Where: GovAI, RAND, CSET, IAPS, AISIs, government roles, frontier lab policy teams</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🛡️</div>
    <h4>5. AI Security / Control Engineering</h4>
    <p>Building the operational defenses around deployed AI — model-weight security, classifier-based filtering, deployment pipelines, incident response. Day: classical security engineering applied to AI artifacts and APIs. Output: hardened systems, incident playbooks, security postures.</p>
    <div class="guard-eng-principle">Where: every frontier lab has a security team; AISIs increasingly hiring; growing market for AI-specific security firms</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">📝</div>
    <h4>6. Distillation / Communication</h4>
    <p>Writing, teaching, course design, blog posts that translate technical AI safety for broader audiences — fellow researchers in adjacent fields, policymakers, general public. Day: reading widely, writing carefully, often combining with one of the other roles. Output: explanatory writing, course material, well-curated resource collections.</p>
    <div class="guard-eng-principle">Where: AI Safety Communications, individual blogs, Alignment Forum, podcasts, dedicated education non-profits</div>
  </div>
</div>

> **The honest observation about role boundaries.** Most senior people in the field do two or more of these. A research engineer who writes a Distill-style piece becomes a distillation contributor. A policy person who runs an eval becomes an evaluator. The roles describe modes of work; careers describe combinations over time.

---

## Where the Work Happens — A Field Map

<div class="ns-diagram">
  <div class="ns-diagram-header">
    <span class="ns-diagram-label">ORGANISATIONAL LANDSCAPE — WHO HIRES WHOM</span>
  </div>
  <div class="ns-diagram-body" style="padding:1.25rem 1.5rem;">
    <div class="ns-node ns-node-cyan" style="max-width:360px;"><div class="ns-node-title">Frontier labs</div><div class="ns-node-sub">Anthropic, OpenAI, Google DeepMind, xAI, Meta. Hire across all six roles. Highest concentration of resources; also commercial pressure on what gets prioritised.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node" style="max-width:360px;"><div class="ns-node-title">AI Safety Institutes</div><div class="ns-node-sub">UK AISI, US AISI, Japan, Singapore, Korea, Canada, EU AI Office. Public-interest evaluators. Hire ML, security, policy. Pre-deployment testing partnerships with frontier labs.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-amber" style="max-width:360px;"><div class="ns-node-title">Evaluation / Safety orgs</div><div class="ns-node-sub">METR, Apollo Research, Redwood Research, ARC, MITRE ATLAS. Smaller, focused, often punching above weight. Strong technical bar; mission-driven.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-purple" style="max-width:360px;"><div class="ns-node-title">Governance / Policy</div><div class="ns-node-sub">GovAI (Oxford), RAND, CSET (Georgetown), IAPS, AI Now, FLI. Plus internal policy teams at frontier labs. Hire policy + technical hybrids.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-red" style="max-width:360px;"><div class="ns-node-title">Independent research</div><div class="ns-node-sub">Funded by Open Phil, Survival & Flourishing Fund, Long-Term Future Fund, individual donors. Output published on Alignment Forum / LessWrong / personal blogs. High autonomy; lower infrastructure.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-green" style="max-width:360px;"><div class="ns-node-title">Academia</div><div class="ns-node-sub">Cambridge AISI, Oxford GovAI, Stanford CRFM/HAI, MIT, CMU, NYU. Different incentive structures; teaching obligations; longer time-horizons. Strong for foundations work.</div></div>
  </div>
</div>

> **What changed in 2024–2026.** The number of AISIs went from one (UK, late 2023) to roughly a dozen by 2026. Government-backed evaluation became a real career path. The frontier labs' safety teams roughly doubled. Independent funding (Open Phil's safety-focused tracks) became more selective and more competitive. The market is more hireable than three years ago, and more demanding in what it takes to clear the bar.

---

## Fellowships and Structured Programs — The On-Ramps

The fastest way to validate that a route is right for you, without a multi-year commitment, is one of the structured programs. The major ones:

<div class="guard-engineering-grid">
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🎯</div>
    <h4>MATS — ML Alignment & Theory Scholars</h4>
    <p>~3 months, research-mentor-paired. Cohort-based. Selects scholars matched to specific senior researchers for a focused research project. One of the most respected on-ramps; alumni regularly transition to research roles at frontier labs and eval orgs.</p>
    <div class="guard-eng-principle">Best for: technical research interest, looking to validate fit and produce a paper</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">⚙️</div>
    <h4>ARENA — Alignment Research Engineer Accelerator</h4>
    <p>~6 weeks, intensive ML engineering with alignment focus. Project-heavy. Designed for engineers who want to work on alignment but need to ramp on alignment-specific tooling and concepts.</p>
    <div class="guard-eng-principle">Best for: ML engineers transitioning into alignment</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🏛️</div>
    <h4>GovAI Fellowship</h4>
    <p>Multi-month policy research fellowship at the Centre for the Governance of AI (Oxford). Produces a substantive policy paper. Strong alumni record at AISIs, government, and policy think tanks.</p>
    <div class="guard-eng-principle">Best for: technical-policy hybrid interest</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">📚</div>
    <h4>Introductory reading-group programs</h4>
    <p>~6-8 week structured curricula offered by several AI-safety education non-profits. Reading-discussion based; cohort-driven. The most accessible introductory programs; many participants then go on to MATS, ARENA, or direct hires.</p>
    <div class="guard-eng-principle">Best for: orientation and decision-making about which deeper program to do</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🔬</div>
    <h4>SERI MATS / SPAR / similar</h4>
    <p>A growing ecosystem of cohort programs with similar structures: applicants paired with mentors, time-bounded research project, demonstrated output. Programs vary in selectivity and focus area.</p>
    <div class="guard-eng-principle">Best for: depending on focus area; check current program rosters</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">💼</div>
    <h4>Direct lab residencies / internships</h4>
    <p>Anthropic, OpenAI, GDM all have residency programs aimed at ML researchers and engineers. Higher bar than open-application fellowships; full-time pay; routinely convert to permanent roles.</p>
    <div class="guard-eng-principle">Best for: experienced ML researchers/engineers ready for production-scale work</div>
  </div>
</div>

> **The general advice on fellowships.** Apply to multiple. Treat the structured program less as a job and more as a six-week to three-month investment in figuring out whether the route works for you. If it does, you have demonstrated output to point at when applying for permanent roles. If it doesn't, you've ruled out a path with much less sunk cost than a full-time job switch would have implied.

---

## Skill Stacks — What to Build, by Route

The honest answer to "what should I learn?" depends on which route you're targeting. The general-purpose advice "learn ML and read alignment papers" is correct but unhelpful. More specifically:

### For Alignment Research

<div class="guard-engineering-grid">
  <div class="guard-eng-card">
    <div class="guard-eng-icon">📐</div>
    <h4>ML fundamentals + transformer internals</h4>
    <p>You should be able to implement a transformer from scratch in PyTorch and explain why each piece exists. Karpathy's "Let's build GPT" is the benchmark exercise. If you can't build GPT-2 in a notebook, you're not ready for alignment research yet.</p>
    <div class="guard-eng-principle">Test: can you reproduce nanoGPT?</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">📝</div>
    <h4>Read 30+ alignment papers carefully</h4>
    <p>Not survey-skim. Carefully — being able to summarise the contribution, methodology, and weaknesses. The MATS reading list and curated lists from major alignment educators are good starting points; this playlist's "further reading" sections are denser still.</p>
    <div class="guard-eng-principle">Test: can you write a 1-page critical summary?</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🧪</div>
    <h4>Replicate a small alignment experiment</h4>
    <p>Pick one paper, replicate the smallest meaningful experiment from it. CAA on Llama-2 (Ch. 7), a small SAE on Pythia, a goal-misgeneralisation toy environment. Producing a working replication is more useful than reading 10 more papers without one.</p>
    <div class="guard-eng-principle">Test: do you have a published replication notebook?</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">📐</div>
    <h4>Mathematical maturity</h4>
    <p>Linear algebra, probability, optimisation, basic functional analysis. For agent foundations and interpretability theory, more — measure theory, category theory, information theory at non-trivial depth. Not strictly required for empirical work, load-bearing for theoretical work.</p>
    <div class="guard-eng-principle">Test: can you read papers without skipping the proofs?</div>
  </div>
</div>

### For Research Engineering

<div class="guard-engineering-grid">
  <div class="guard-eng-card">
    <div class="guard-eng-icon">⚙️</div>
    <h4>Production ML engineering</h4>
    <p>Distributed training, GPU-cluster operations, training-pipeline reliability, JAX/PyTorch at scale. The skills that make you productive at an actual lab. Often the binding constraint, not the theory.</p>
    <div class="guard-eng-principle">Test: have you trained a model larger than 1B parameters end-to-end?</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🛠️</div>
    <h4>Tooling fluency</h4>
    <p>Weights & Biases, neptune, or similar experiment tracking. Hugging Face transformers, datasets, accelerate. Common eval harnesses (Inspect AI, EleutherAI eval-harness). The infrastructure that ML labs run on.</p>
    <div class="guard-eng-principle">Test: can you set up a reproducible eval pipeline in a day?</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🧹</div>
    <h4>Code quality discipline</h4>
    <p>Type-checked, tested, well-structured. Research engineering at frontier labs is the difference between a notebook that works once and a system that 30 researchers use daily. Care about correctness, latency, and maintainability.</p>
    <div class="guard-eng-principle">Test: would your code review well in a frontier-lab codebase?</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🤝</div>
    <h4>Cross-functional collaboration</h4>
    <p>Research engineers sit between researchers and infrastructure. The technical fluency is necessary but not sufficient — you need to translate, prioritise, and unblock. Soft skills are part of the role.</p>
    <div class="guard-eng-principle">Test: have you owned a system someone else depended on?</div>
  </div>
</div>

### For Evaluations / Red-Teaming

<div class="guard-engineering-grid">
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🎯</div>
    <h4>Threat modeling</h4>
    <p>The eval-design question is "what specific risk are we trying to measure?" Strong evaluators come with crisp threat models — a story about who the adversary is, what they want, and how the model could enable them.</p>
    <div class="guard-eng-principle">Test: can you write a one-paragraph threat model that holds up to scrutiny?</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🧪</div>
    <h4>Empirical methodology</h4>
    <p>The Hobbhahn science-of-evals discipline (Ch. 8) — elicitation discipline, statistical sufficiency, adversarial robustness, calibration. Most evals fail at methodology before they fail at concept.</p>
    <div class="guard-eng-principle">Test: can you defend your eval's methodology against a hostile review?</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🛡️</div>
    <h4>Domain knowledge</h4>
    <p>Cyber evals need cyber knowledge. Bio evals need bio knowledge. Persuasion evals need behavioural-science knowledge. Generic ML credentials are not enough; the eval's quality depends on the evaluator understanding the threat domain.</p>
    <div class="guard-eng-principle">Test: do you bring domain expertise that the lab doesn't already have in-house?</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">📝</div>
    <h4>Writing and reporting</h4>
    <p>Eval reports are the artifact, not the evaluation. A good evaluator writes results that policymakers, researchers, and developers can actually use. Eval work that doesn't communicate clearly never lands.</p>
    <div class="guard-eng-principle">Test: have you written an eval report someone acted on?</div>
  </div>
</div>

### For Policy / Governance

<div class="guard-engineering-grid">
  <div class="guard-eng-card">
    <div class="guard-eng-icon">📜</div>
    <h4>Technical literacy at policy depth</h4>
    <p>You don't need to train models, but you need to read AI papers without panic. Be able to translate "the model passed the eval" or "the RSP was triggered" into something a regulator can act on. The technical-translator role is rare and high-leverage.</p>
    <div class="guard-eng-principle">Test: can you brief a policymaker on RSPs in 10 minutes?</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🏛️</div>
    <h4>Regulatory analogues</h4>
    <p>Understand how aviation, pharma, finance, and nuclear regulation actually work. The good policy proposals borrow from these; the bad ones reinvent. Your value-add is often comparative analysis between regulatory traditions.</p>
    <div class="guard-eng-principle">Test: can you compare FDA, FAA, and EU AI Act on a structural property?</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🌐</div>
    <h4>International coordination</h4>
    <p>Treaties, export controls, mutual recognition, AISI networks. The Ch. 5 territory. International law / international relations background helps; not strictly required, but the senior people you'll work with all have some.</p>
    <div class="guard-eng-principle">Test: can you sketch how a multi-jurisdiction safety regime could work?</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">✍️</div>
    <h4>Policy writing</h4>
    <p>Briefs, white papers, regulatory comments, draft text. The policy product is writing. Strong policy work compounds into influence; weak writing dissipates regardless of underlying analysis quality.</p>
    <div class="guard-eng-principle">Test: have you written a policy brief someone cited?</div>
  </div>
</div>

### For AI Security / Control

<div class="guard-engineering-grid">
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🔐</div>
    <h4>Classical security foundations</h4>
    <p>Threat modeling, OWASP-tier knowledge of common attacks, hardware-rooted trust, supply-chain security. Ch. 4's argument: AI security is computer security, with new specifics. Bring the classical foundation.</p>
    <div class="guard-eng-principle">Test: do you have a security background that pre-dates LLMs?</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🛠️</div>
    <h4>ML-specific attack surfaces</h4>
    <p>Jailbreaks (GCG, persona, encoding), prompt injection, model extraction, adversarial examples, glitch tokens, backdoored checkpoints. Ch. 4 and Ch. 9 territory; build hands-on familiarity, not just literature awareness.</p>
    <div class="guard-eng-principle">Test: can you reproduce a GCG attack on a 7B model?</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🧱</div>
    <h4>Defense engineering</h4>
    <p>Constitutional Classifiers, sandbox design, capability-permissioned tools, audit logging. Building defences that are deployable at scale, not just demonstrable in a notebook.</p>
    <div class="guard-eng-principle">Test: have you shipped a security-relevant component in production?</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🚨</div>
    <h4>Incident response posture</h4>
    <p>Runbooks, monitoring, post-incident review. The work doesn't stop at deployment; the operational layer is where most real safety value lives.</p>
    <div class="guard-eng-principle">Test: have you been on an incident-response rotation?</div>
  </div>
</div>

---

## The 1-Pager — Forcing Concreteness

The single most useful exercise that GovAI and similar programs assign: write a one-page document describing a specific contribution you intend to make.

<div class="ns-diagram">
  <div class="ns-diagram-header">
    <span class="ns-diagram-label">THE 1-PAGER STRUCTURE</span>
  </div>
  <div class="ns-diagram-body" style="padding:1.25rem 1.5rem;">
    <div class="ns-node ns-node-cyan" style="max-width:360px;"><div class="ns-node-title">1. The problem</div><div class="ns-node-sub">One paragraph. What specific gap in AI safety are you addressing? Be narrow — "alignment" is too broad; "improving the calibration of capability evals on cyber tasks" is the right grain.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node" style="max-width:360px;"><div class="ns-node-title">2. The approach</div><div class="ns-node-sub">One paragraph. What specifically will you do? "Read more papers" is not an approach. "Replicate the Sharma et al. Constitutional Classifiers result on Llama-3 and measure overhead" is.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-amber" style="max-width:360px;"><div class="ns-node-title">3. The artifact</div><div class="ns-node-sub">What will exist that didn't before, after you finish? A paper, a codebase, a report, a benchmark, a policy brief. Concrete, citable, point-to-able.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-purple" style="max-width:360px;"><div class="ns-node-title">4. The theory of impact</div><div class="ns-node-sub">If your artifact succeeds, how does that reduce expected harm? The Ch. 6 / Ch. 7 discipline applied to your own work. If you can't write a causal story, the project isn't ready.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-red" style="max-width:360px;"><div class="ns-node-title">5. Timeline + checkpoints</div><div class="ns-node-sub">Specific dates. Mid-project checkpoint. Final delivery. What does done look like? When does it happen? If you're working with a mentor, this is the structure they need to evaluate progress.</div></div>
    <div class="ns-arrow"></div>
    <div class="ns-node ns-node-green" style="max-width:360px;"><div class="ns-node-title">6. Required resources</div><div class="ns-node-sub">Compute. Mentor time. Funding. Access to specific models. Data. The 1-pager is also how you ask for what you need; vague asks get refused.</div></div>
  </div>
</div>

> **Why the exercise works.** Most "I want to work on AI safety" plans dissolve at step 2 — you can't specify the approach because you haven't picked a narrow enough problem. The 1-pager forces narrowing. Forces theory of impact. Forces an actual deliverable. Most people who write their first 1-pager realise they've been thinking at the wrong grain; the exercise is doing its job when that happens.

The secondary use: the 1-pager is your application material. MATS, ARENA, GovAI, and direct lab applications all evaluate something close to this. If you have a strong 1-pager and demonstrated execution toward it, you're a far more compelling candidate than someone with strong general credentials and no concrete plan.

---

## Common Failure Modes for People New to the Field

The patterns that waste the first six months for people getting into AI safety:

<div class="guard-threats-grid">
  <div class="guard-threat-card guard-threat-misuse">
    <div class="guard-threat-icon">📚</div>
    <h4>Permanent reading mode</h4>
    <p>Reading is necessary; reading without producing artifact is decorative. After 4-6 weeks of reading, you should be replicating a paper or drafting a 1-pager. People who've been "reading up on alignment" for a year without output are not actually closer to contributing than they were at three months.</p>
    <span class="guard-threat-defense">Fix: produce something — a notebook, a write-up, a 1-pager — by month 2</span>
  </div>
  <div class="guard-threat-card guard-threat-misuse">
    <div class="guard-threat-icon">🎯</div>
    <h4>Picking the wrong grain</h4>
    <p>"I want to solve alignment" and "I want to improve the calibration of cyber-uplift evals on Anthropic's pre-deployment suite" are the same career question at different grain. The first is unactionable; the second can be done in a fellowship. Narrow until you have something tractable.</p>
    <span class="guard-threat-defense">Fix: keep narrowing until your project fits in a 1-pager</span>
  </div>
  <div class="guard-threat-card guard-threat-misuse">
    <div class="guard-threat-icon">🏛️</div>
    <h4>Optimising for prestige over fit</h4>
    <p>"I want to work at Anthropic" is a destination, not a plan. The route depends on your background and interests; sometimes the more direct route is METR or an AISI rather than a frontier lab. Pick the right organisation for the work, not the brand.</p>
    <span class="guard-threat-defense">Fix: pick the route that fits your skills, not the one that sounds best at parties</span>
  </div>
  <div class="guard-threat-card guard-threat-misuse">
    <div class="guard-threat-icon">📐</div>
    <h4>Skipping the ML fundamentals</h4>
    <p>For technical roles, the failure mode is wanting to do interpretability without being able to implement a transformer, wanting to do RLHF without understanding PPO, wanting to do agent foundations without the math. The fundamentals are not optional; the alignment-specific layer goes on top of them.</p>
    <span class="guard-threat-defense">Fix: build the ML stack first; alignment-specific work is layer 2</span>
  </div>
  <div class="guard-threat-card guard-threat-misuse">
    <div class="guard-threat-icon">🌪️</div>
    <h4>Direction-jumping every two months</h4>
    <p>Interpretability one month, governance the next, control the third. Each direction has a learning curve; jumping resets it. Pick a direction, give it 3-6 months of real engagement before deciding it's not for you.</p>
    <span class="guard-threat-defense">Fix: commit to one direction for at least one fellowship cycle</span>
  </div>
  <div class="guard-threat-card guard-threat-misuse">
    <div class="guard-threat-icon">🔇</div>
    <h4>Working in isolation</h4>
    <p>Alignment is a small field. Most progress happens through conversations, mentor relationships, code review, and Alignment Forum discussion. Working alone in a notebook for 6 months without external feedback usually produces worse output than 4 months with structured feedback.</p>
    <span class="guard-threat-defense">Fix: get into a fellowship cohort or an explicit mentor relationship</span>
  </div>
</div>

---

## A Concrete Three-Month Plan for Someone Just Starting

For a hypothetical reader at the end of this playlist who wants to convert reading into contribution. Three months, calibrated to be ambitious-but-achievable for someone with a CS undergrad and curiosity.

<div class="guard-engineering-grid">
  <div class="guard-eng-card">
    <div class="guard-eng-icon">📅</div>
    <h4>Month 1 — Fundamentals + orientation</h4>
    <p>Karpathy's "Let's build GPT" end-to-end. ARENA-style transformer-from-scratch implementation. Read 10 papers from the further-reading lists across Chapters 1, 3, 7, 8 — choose those that match your interest. Write 1-paragraph summaries of each. Apply to MATS / ARENA / GovAI / an introductory reading-group program for the next cohort.</p>
    <div class="guard-eng-principle">Output: nanoGPT replicated; 10 paper summaries; fellowship apps submitted</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">📅</div>
    <h4>Month 2 — Pick a direction; replicate</h4>
    <p>From Chapter 7's portfolio, pick one focal direction that genuinely interests you. Replicate the smallest meaningful experiment from a key paper in that direction (CAA on Llama-2; a small SAE on Pythia; a goal-misgeneralisation environment from the DeepMind paper). Write up the replication as a public notebook. Start drafting your 1-pager.</p>
    <div class="guard-eng-principle">Output: replicated experiment, public notebook, draft 1-pager</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">📅</div>
    <h4>Month 3 — Original contribution + visibility</h4>
    <p>Take your replication one step further — a small variation, a new evaluation, a comparison to a different model. Get feedback from someone in the field (Alignment Forum post; mentor conversation; submission to a workshop). Refine the 1-pager based on what you learned. Apply to permanent roles or further fellowships armed with concrete output.</p>
    <div class="guard-eng-principle">Output: small original contribution, feedback received, polished 1-pager</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🔄</div>
    <h4>Adjust as you learn</h4>
    <p>This plan is calibrated for the technical-research route. If you're targeting policy or governance, replace "replicate the paper" with "write a policy brief on [specific RSP/regulatory question]." Same shape — read, narrow, produce, refine, apply — different artifacts.</p>
    <div class="guard-eng-principle">Principle: same arc, route-specific artifacts</div>
  </div>
</div>

> **The goal of the three-month plan.** Not to "solve" anything. To convert the abstract intent of "I want to contribute to AI safety" into a concrete artifact that demonstrates you can. The artifact is what unlocks the rest of the field — fellowships, mentorships, hires, the next-step opportunities that compound from there.

---

## What This Implies for Practice

<div class="guard-engineering-grid">
  <div class="guard-eng-card">
    <div class="guard-eng-icon">📐</div>
    <h4>Pick the route, not the destination</h4>
    <p>"AI safety" is six different jobs. Pick which one matches your background, interests, and the way you actually like to work day-to-day. The destination follows from the route.</p>
    <div class="guard-eng-principle">Principle: routes drive destinations, not the other way around</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">⏱️</div>
    <h4>Use fellowships to validate fit cheaply</h4>
    <p>Three months of MATS or ARENA or GovAI tells you whether the route works for you with much less downside than a multi-year commitment. If the fellowship goes well, you have output to leverage; if it doesn't, you've narrowed your search at low cost.</p>
    <div class="guard-eng-principle">Principle: fellowships are calibrated risk</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">📝</div>
    <h4>Convert reading to artifact early</h4>
    <p>Permanent reading mode is the most common first-year failure. Before month 3, you should have produced something — a replication, a write-up, a 1-pager. Reading without output isn't progress.</p>
    <div class="guard-eng-principle">Principle: artifact-driven progress, not consumption-driven</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🎯</div>
    <h4>Narrow until your project fits a 1-pager</h4>
    <p>If you can't fit your project into the 1-pager structure, it's still too broad. Narrow ruthlessly. The 1-pager is the diagnostic for whether you're at the right grain.</p>
    <div class="guard-eng-principle">Principle: narrowness is a feature</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🤝</div>
    <h4>Get feedback structurally, not occasionally</h4>
    <p>Mentor relationships, fellowship cohorts, Alignment Forum posts that solicit comments. The structural feedback loops are what produce good work. Working in isolation almost always produces worse output, slower.</p>
    <div class="guard-eng-principle">Principle: feedback as infrastructure</div>
  </div>
  <div class="guard-eng-card">
    <div class="guard-eng-icon">🛠️</div>
    <h4>Build the fundamentals you'll always need</h4>
    <p>For technical routes: ML, transformer internals, eval harnesses, training infrastructure. For policy routes: regulatory analogues, technical literacy, policy writing. For governance/security: classical security plus ML-specific. The fundamentals compound; the alignment-specific layer goes on top.</p>
    <div class="guard-eng-principle">Principle: layer 1 first, layer 2 second</div>
  </div>
</div>

---

## At a Glance

<div class="guard-summary-card">
  <div class="guard-summary-col">
    <div class="guard-summary-label">WHAT</div>
    <p>Contributing to AI safety means picking one of six distinct kinds of work — research, engineering, evaluations, policy, security, distillation — and a route through it that matches your background. Where the work happens: frontier labs, AI Safety Institutes, evaluation orgs, governance organisations, independent research, academia. The on-ramps are structured fellowships (MATS, ARENA, GovAI, intro reading-group programs, lab residencies); the diagnostic is the 1-pager exercise.</p>
  </div>
  <div class="guard-summary-divider"></div>
  <div class="guard-summary-col">
    <div class="guard-summary-label">WHY</div>
    <p>The previous nine chapters laid out what AI safety is. None of it matters if no one builds it. The market is more hireable than three years ago and more demanding in what it takes to clear the bar; the route in is to validate fit through fellowships, build artifacts that demonstrate you can do the work, and apply with concrete output rather than general credentials.</p>
  </div>
  <div class="guard-summary-divider"></div>
  <div class="guard-summary-col">
    <div class="guard-summary-label">RULE OF THUMB</div>
    <p>Pick a route that matches how you like to work, not the destination that sounds best. Use a fellowship to validate the fit. Convert reading to artifact by month 3. Narrow your project until it fits a 1-pager. Get structured feedback. Build the fundamentals first; the alignment-specific layer goes on top.</p>
  </div>
</div>

---

## Key Takeaways

- **AI safety is six distinct kinds of work, not one.** Research, engineering, evaluations, policy, security, distillation. Pick the route that matches your background and how you like to work — the destination follows.

- **The organisational landscape is broader than "frontier labs."** AISIs, evaluation orgs (METR, Apollo, Redwood, ARC), governance shops (GovAI, RAND, CSET, IAPS), independent researchers, and academia all hire across roles. Optimise for fit with the work, not for prestige of the brand.

- **Fellowships are calibrated risk.** MATS, ARENA, GovAI, intro reading-group programs, lab residencies — all let you test a route in three to six months with much less commitment than a full job switch. Apply to multiple; treat the program as a fit-validation device.

- **Skill stacks differ by route, but the fundamentals always come first.** ML and transformer internals for technical work. Regulatory analogues and policy writing for governance. Classical security plus ML-specific for control. Build layer 1 first; alignment-specific work is layer 2.

- **The 1-pager is the diagnostic.** Problem, approach, artifact, theory of impact, timeline, resources. If your project doesn't fit the structure, it's not narrow enough yet. Most "I want to work on AI safety" plans dissolve at the approach step; the 1-pager forces resolution.

- **Permanent reading mode is the most common first-year failure.** After 4–6 weeks of reading, you should be producing artifacts — replicated experiments, write-ups, 1-pagers. Reading without output isn't progress, no matter how much you read.

- **Direction-jumping resets the learning curve.** Each direction has 3–6 months of ramp before contribution is plausible. Commit to one for at least a fellowship cycle before deciding it's wrong.

- **Feedback infrastructure produces better work, faster.** Mentor relationships, fellowship cohorts, Alignment Forum posts soliciting comments. The structural feedback loops are non-negotiable; isolation almost always produces worse output than collaborative work in the same time.

- **Convert intent into artifact, then artifacts into roles.** The transition from "I want to contribute" to "I am contributing" is mediated by demonstrable output. Replication notebooks, written 1-pagers, completed fellowship projects — these are what unlock the next-step opportunities that compound from there.

---

## Further Reading

- 80,000 Hours, *AI safety technical research* career guide — the canonical generalist guide for technical AI safety careers.
- Alignment Forum, *"How to pursue a career in technical AI alignment"* — community-curated advice and examples.
- ML Alignment & Theory Scholars (MATS) program — application materials and alumni outputs are public; reading them gives you the concrete output bar.
- ARENA program materials — public, including detailed week-by-week curriculum.
- Centre for the Governance of AI (GovAI) Fellowship — application materials and prior fellow outputs.
- Andrej Karpathy, *"Let's build GPT: from scratch, in code, spelled out"* — the canonical exercise for transformer fluency.
- Anthropic, OpenAI, GDM Careers pages — the active hiring landscape; reading current postings is the best signal of what skills the field is currently demanding.
- Open Philanthropy, *AI Safety grants* — the funding landscape for independent research.

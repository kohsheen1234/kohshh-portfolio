---
layout: page
title: "GraphRAG Repair Chatbot"
description: An appliance repair assistant powered by a Neo4j knowledge graph and dual-retrieval RAG — graph queries and semantic search working in parallel.
img:
importance: 2
category: work
github: https://github.com/kohsheen1234/case-study
---

## The Problem

Appliance repair information is scattered across manufacturer manuals, user reviews, Q&A forums, and repair stories — each covering different slices of the same problem from different angles. A user trying to fix their ice maker needs to navigate part compatibility databases, installation instructions, symptom-to-fix mappings, and community troubleshooting threads, all structured differently and hosted in different places.

Traditional search returns documents. What you actually need is to traverse relationships: this symptom is fixed by this part, which is compatible with this model, and here's how someone with the same problem installed it.

## Architecture

The system has three layers: a scraper that builds the knowledge graph, a dual-retrieval backend that queries it, and a React chat interface.

### Data Ingestion — Node.js Scraper

A purpose-built scraper crawls [PartSelect](https://www.partselect.com/) to extract structured appliance data across multiple entity types:

- **Models** — model numbers, brands, appliance types, descriptions
- **Parts** — part numbers, prices, ratings, review counts, manufacturer info
- **Symptoms** — common failure modes mapped to the parts that fix them (with fix percentages)
- **Instructions** — step-by-step repair guides with difficulty ratings and time estimates
- **Reviews, Q&A, Repair Stories** — community knowledge tied to specific parts and models

Each entity type has a dedicated scraper (`modelScraper.js`, `partsScraper.js`, `modelSymptomDetails.js`, `modelInstructionsScraper.js`) that handles pagination, nested pages, and the specific DOM structure of each data type.

### Knowledge Graph — Neo4j

The scraped data is loaded into a Neo4j graph with 11 entity types and rich relationships:

```
Part -[COMPATIBLE_WITH]-> Model
Part -[HAS_REVIEW]-> Review
Part -[HAS_REPAIR_STORY]-> RepairStory
Part -[HAS_QUESTION]-> Question -[HAS_ANSWER]-> Answer
Part -[MANUFACTURED_BY]-> Manufacturer
Model -[HAS_SYMPTOM]-> Symptom -[FIXED_BY]-> Part
Model -[HAS_INSTRUCTION]-> Instruction -[USED_IN]-> Part
Model -[HAS_MANUAL]-> Manual
Model -[HAS_SECTION]-> Section
```

This graph structure is what makes the system powerful. A single traversal can answer: "My Whirlpool fridge's ice maker isn't working — what part fixes it, is it compatible with my model, how hard is the install, and what did other people say about it?" That query touches five entity types and four relationships. A vector database would need five separate retrievals and hope the embeddings are close enough.

### Dual-Retrieval Agent — FastAPI + LangChain

The backend exposes a `/agent/` endpoint running a LangChain ReAct agent with two tools:

**Graph Query tool** — Takes the user's natural language input, generates a Cypher query via GPT-4, validates and optimizes it through a second LLM pass, then executes it against Neo4j. The Cypher generation prompt encodes the full graph schema with relationship directions, property names, and query patterns. Failed queries are retried up to 3 times with refinement.

**Semantic Search tool** — Runs a vector similarity search over embedded node properties for fuzzy matching when the user's phrasing doesn't map cleanly to graph entities. Catches cases where the user describes a symptom in their own words rather than using the exact terminology in the graph.

These tools can run in two modes:

- **Sequential** — The agent decides which tool to use based on the query, uses it, evaluates the result, and optionally calls the second tool if the first result is insufficient.
- **Parallel** — Both tools fire simultaneously and results are combined, giving the agent a richer context to reason over.

Both modes support **session memory** via `ConversationBufferMemory` — the agent checks conversation history before calling any tools, enabling multi-turn troubleshooting conversations where context carries forward.

Every response includes a confidence score (0-100) and confidence interval, so the user knows how much to trust the answer.

### Chat Interface — React

A React frontend provides the conversational UI. Messages are sent to the FastAPI backend, which routes them through the agent and streams back structured responses with part details, installation steps, and confidence scores.

## Why Graph + Semantic

The key design decision is using both retrieval methods rather than choosing one:

- **Graph retrieval** excels at structured queries: part compatibility, symptom-to-fix mappings, finding instructions for a specific model. The relationships are explicit and traversals are exact.
- **Semantic retrieval** excels at fuzzy matching: "my dishwasher is making a grinding noise" maps to the right symptom even if the graph stores it as "abnormal noise during wash cycle."

Running both in parallel and combining results gives the agent precise structural answers from the graph plus fuzzy coverage from embeddings — each compensating for the other's weakness.

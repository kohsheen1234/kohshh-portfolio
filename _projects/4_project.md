---
layout: page
title: "Copula Pairs Trading"
description: Time-varying and mixed copula models for nonlinear pairs trading — selected to represent NYU at the IAQF 2023 competition.
img:
importance: 1
category: quant
github: https://github.com/kohsheen1234/IAQF_PairsTrading2023
---

Selected to represent NYU at the [International Association for Quantitative Finance (IAQF)](https://iaqf.org/) 2023 competition, under the guidance of Prof. Ronald Slivka, Ph.D.

## The Problem

Pairs trading strategies traditionally rely on correlation or cointegration to identify mean-reverting spreads between two assets. Both assume a linear relationship. In practice, asset price dependencies are nonlinear, regime-dependent, and exhibit tail behavior that linear models miss entirely. A spread that appears stationary under normal conditions can blow up during stressed markets — precisely when you need the hedge to hold.

The IAQF problem statement asked: given two equity indices, develop a pairs trading strategy that allows for a nonlinear relationship and generates alpha.

## Approach

We developed a multi-stage pipeline that replaces the linear assumption with copula-based dependency modeling, and compared it against several baselines including cointegration, LSTM, and reinforcement learning approaches.

### Pair Selection via Clustering

Rather than testing every possible pair, we used unsupervised clustering on daily returns of major equity indices (S&P 500, Russell 2000, NASDAQ, Dow Jones, and others) to identify groups of structurally similar assets. Within each cluster, pairs were screened for cointegration as a baseline filter, then tested for nonlinear dependence using rank-based correlation measures (Kendall's tau, Spearman's rho) that capture monotonic relationships beyond Pearson's linear correlation.

### GARCH-Filtered Returns

Raw returns carry time-varying volatility that contaminates dependency estimation. We applied GARCH(1,1) filtering to extract standardized residuals — removing the volatility dynamics so the copula can focus on modeling the pure dependency structure. This is critical: without the GARCH filter, the copula conflates volatility clustering with genuine changes in the dependency between assets.

### Copula Fitting and Selection

We fitted multiple copula families to the GARCH-filtered residuals:

- **Gaussian copula** — symmetric dependency, no tail concentration
- **Student-t copula** — symmetric with heavier tails, captures joint extreme moves
- **Gumbel copula** — asymmetric, concentrates dependency in the upper tail
- **Clayton copula** — asymmetric, concentrates dependency in the lower tail
- **Frank copula** — symmetric, no tail dependency

Each copula was evaluated via maximum likelihood estimation and goodness-of-fit testing. The Gaussian and Student-t copulas consistently showed the best fit after GARCH filtering — the GARCH step absorbed much of the tail behavior that otherwise favored asymmetric copulas like Gumbel.

We also explored **mixed copulas** (weighted combinations of multiple families) and **time-varying copulas** where the dependency parameter evolves over time, adapting to regime shifts in the market.

### Trading Signal Generation

The copula model produces a conditional probability: given the current return of asset A, what is the probability that asset B's return exceeds its observed value? When this conditional probability diverges far from 0.5, the spread is mispriced relative to the copula's dependency model. We enter trades when the mispricing exceeds a threshold and exit when it reverts.

## Approaches Compared

The repository contains four independent approaches to the same problem:

| Approach | Method | Key Idea |
|---|---|---|
| **Linear baseline** | Cointegration + mean reversion | Classical Engle-Granger, assumes linear spread |
| **Copula** | GARCH + time-varying copula | Nonlinear dependency, regime-adaptive |
| **LSTM** | Deep learning on log-returns | Learn spread dynamics from sequences |
| **Reinforcement learning** | DQN agent on spread states | Learn optimal entry/exit policy directly |

The copula approach outperformed the linear baseline by capturing dependency structures that cointegration misses — particularly during regime transitions and stressed markets where tail dependencies dominate.

## Why Copulas Matter for Pairs Trading

The core insight is separation of concerns. A copula decomposes a joint distribution into two parts: the marginal distributions of each asset (handled by GARCH), and the dependency structure between them (handled by the copula). This separation means you can model volatility and dependency independently, update each component at its natural frequency, and swap components without rebuilding the entire model.

In practice, this means the strategy adapts to changing market conditions: the GARCH filter tracks volatility in real time, and the time-varying copula tracks how the relationship between assets evolves — catching regime shifts that would blindside a static cointegration model.

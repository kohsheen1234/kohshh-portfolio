---
layout: page
title: "HRL Goal-Based Investing"
description: Hierarchical reinforcement learning for goal-based investing — a two-tiered framework that unifies stock selection and portfolio optimization for medium-long horizon investment.
img:
importance: 3
category: quant
github: https://github.com/kohsheen1234/IAQF_PairsTrading2023
---

Built during a research engagement at **Bank of America** (Summer 2023, Industry Advisor: Cristian Homescu), with Shiyu Hao, Peixin Tang, Nanyu Jiang, and Yu Gu.

## The Problem

Traditional portfolio management treats stock selection and weight optimization as separate problems. You pick assets using one model, then allocate across them using another. This disconnect means the selection model has no awareness of how its choices affect downstream optimization, and the optimizer has no say in which assets it gets to work with.

Goal-based investing (GBI) adds another layer: the objective isn't to maximize risk-adjusted returns against a benchmark — it's to maximize the probability that portfolio wealth W exceeds a consumption target C at maturity T:

**Maximize P(W<sub>t</sub> >= C<sub>t</sub>)**

This shifts the entire optimization landscape. Risk is no longer volatility — it's the probability of not reaching the goal.

## Hierarchical Reinforcement Learning

We addressed both problems simultaneously using a two-tiered HRL framework where a high-level agent selects stocks and a low-level agent optimizes portfolio weights — and the two learn jointly.

### High-Level Agent — Stock Selection

The high-level agent (HLA) operates at the **period level** (every 21 trading days), selecting which assets to hold for the upcoming period. Its architecture combines:

**GRU layers** — Capture temporal dynamics in sequential price data, retaining long-term dependencies across trading days.

**Global attention** — Weights different time steps differently, allowing the model to focus on the most informative moments in the price history (earnings surprises, regime shifts, momentum breakpoints).

**Self-attention** — Models inter-stock relationships by mapping temporal representations to query, key, and value matrices. This is critical: it lets the agent understand that when energy stocks move, utilities tend to follow — capturing sector co-movements and cross-asset dependencies that a stock-by-stock model would miss.

The self-attention mechanism computes:

```
Q = W_Q * U,  K = W_K * U,  V = W_V * U
U' = softmax(QK^T / sqrt(d_k)) * V
S = tanh(W * U' + b)
```

where S is the **profitability score** for each stock — the signal that drives selection. The HLA picks the top-scoring assets for the next period.

The HLA is trained using **Advantage Actor-Critic (A2C)** via Stable Baselines. The actor selects assets based on profitability scores; the critic estimates the value of those selections. The reward has two components: immediate reward from the quality of selected stocks, and aggregate reward from how well the low-level agent performs with those selections.

### Low-Level Agent — Portfolio Optimization

The low-level agent (LLA) operates at the **daily level** within each period, continuously adjusting portfolio weights across the stocks chosen by the HLA.

**State** — A tensor of shape (L, M+1, F) capturing the lookback window L, M selected stocks plus cash, and F features (close, open, high, low, volume).

**Action** — Continuous weight vector W = (w<sub>0</sub>, w<sub>1</sub>, ..., w<sub>N</sub>) where weights sum to 1.

**Reward** — Directly tied to the goal-based objective:

```
R = -alpha * exp((P_t - GOAL)^2 / T) + mu * R_{t+1} - gamma * sigma^2 - theta * MDD - cost
```

The first term penalizes distance from the target wealth. The remaining terms balance portfolio return, volatility, maximum drawdown, and transaction costs. The exponential penalty on goal distance means the agent is increasingly punished as the portfolio drifts further from the consumption target — a fundamentally different incentive structure than maximizing Sharpe.

The LLA uses a **custom CNN** embedded within **Proximal Policy Optimization (PPO)** to extract features from the price tensor and output portfolio weights. PPO's clipped objective prevents destructively large policy updates — important when portfolio weights directly translate to real capital allocation.

## How the Levels Interact

The two agents share an environment but operate at different time scales:

1. At the start of each period, the **HLA selects stocks** based on profitability scores from GRU + attention.
2. Every day within that period, the **LLA adjusts weights** across the selected stocks to maximize goal-reaching probability.
3. The LLA's cumulative reward feeds back into the HLA's training signal — so the HLA learns to select stocks that are not just individually promising, but collectively optimizable.

This feedback loop is what makes the framework end-to-end: the selection model learns what makes a good portfolio, not just what makes a good individual stock.

## Experiment Setup

We tested on **30 diverse indices** from Bloomberg spanning bonds (LBUSTRUU), global equities (MSCI Europe, Japan, North America, Pacific), sector ETFs (S&P 500 Consumer Discretionary, Energy, Financials, Health Care, Tech, Utilities), size factors (Russell 1000 Growth/Value, Russell 2000, Microcap), and commodities (BCOMTR).

Stock prices were simulated forward using **Monte Carlo simulation** with Geometric Brownian Motion calibrated to historical log-returns — testing the strategy across thousands of possible market paths rather than a single historical trajectory.

**Baselines compared:**

| Strategy | Description |
|---|---|
| TSM | Time-series momentum — select positive-return stocks |
| CSM | Cross-sectional momentum — select top-2 performers |
| MR | Mean reversion — buy below Bollinger Band |
| UCRP | Uniform constant re-balanced portfolio (equal weight) |
| HLA + UCRP | HLA stock selection with equal weighting |

## Results

On the test set, the HRL model outperformed all baselines:

| Metric | HRL |
|---|---|
| Annualized Return | **7.81%** |
| Annualized Sharpe | **0.63** |

The model achieved the highest annualized return and Sharpe ratio among all strategies. The key advantage is adaptability: unlike static momentum or mean-reversion rules, the RL agents update their policies based on observed rewards, exploiting changing market conditions across regimes. The mean-reversion baseline showed a negative Sharpe ratio, highlighting its inability to adapt to trending markets within the simulation.

Achieved an **18% improvement in annualized returns** and a **Sharpe ratio of 2.3** over traditional Mean-Variance Optimization on targeted backtests — demonstrating that the goal-based objective coupled with hierarchical decision-making produces materially better outcomes than the standard efficient frontier approach.

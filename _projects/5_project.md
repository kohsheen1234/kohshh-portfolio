---
layout: page
title: "Fixed Income Quant Trading"
description: Cointegrated butterfly strategies on Eurodollar futures — AR(1) signal forecasting, signal combination, and quality metrics across market regimes.
img:
importance: 2
category: quant
github: https://github.com/kohsheen1234/FixedIncomeQuantTrading
---

## The Setup

Eurodollar (ED) futures are among the most liquid instruments in fixed income markets. Their constant-maturity rates at different tenors (2y, 3y, 4y, 5y) move together but not identically — the spreads between them carry information about the term structure and mean-revert over time. A butterfly trade exploits this by going long the wings and short the belly (or vice versa), betting that a temporary distortion in the curve will correct itself.

The question is how to weight the legs of the butterfly so the resulting spread is stationary, and how to build a forecasting model that tells you when to enter and exit.

## Cointegrated Butterflies

The first step is constructing butterfly spreads that are genuinely cointegrated — not just correlated. We formulated three butterfly combinations from constant-maturity ED rates:

| Butterfly | Wings | Belly |
|---|---|---|
| BF-1 | 2y, 5y | 3y |
| BF-2 | 3y, 5y | 4y |
| BF-3 | 2y, 4y | 3y |

The belly weight is fixed at 1. The wing weights are estimated using the **Box-Tiao canonical decomposition** (Canonical Correlation Analysis between levels and their lags), which finds the linear combination with maximum mean-reversion speed. This is more principled than ad-hoc weight selection — the CCA eigenvector corresponding to the largest eigenvalue gives the combination that reverts fastest.

Weights were estimated on **Sample A** (2010-2014), then held fixed for all subsequent analysis.

## Signal Construction

With the butterfly spreads defined, we built three forecasting signals on **Sample B** (2014-2016), each capturing a different view of the spread's deviation from equilibrium.

Define z(t, &lambda;) as the butterfly level minus its exponential moving average with decay parameter &lambda;:

**Signal 1** (&lambda; = 0) — AR(1) fitted to the raw butterfly spread (constant mean case). This is the simplest model: the spread deviates from its historical mean and reverts.

**Signal 2** (&lambda; = 0.05) — AR(1) fitted to the spread minus a slow-moving EMA. The EMA absorbs gradual structural shifts in the curve, so the signal focuses on shorter-term dislocations.

**Signal 3** (&lambda; = 0.1) — AR(1) fitted to the spread minus a faster EMA. More aggressive detrending — captures only the highest-frequency mean-reversion.

Each AR(1) model is estimated in a **rolling 6-month window** and produces a **5-day-ahead forecast**. The rolling estimation allows the model parameters to adapt as market dynamics shift, while the fixed horizon provides a consistent signal for trading decisions.

## Signal Combination

Signals 1-3 each capture different frequencies of mean-reversion. Rather than choosing one, we combined them:

**Signal 4** = w&#8321; &middot; Signal 1 + w&#8322; &middot; Signal 2 + w&#8323; &middot; Signal 3

The weights w&#8321;, w&#8322;, w&#8323; were optimized over the range [0, 1] on Sample B to minimize forecast error. The combined signal outperformed any individual signal by blending the structural (low &lambda;) and tactical (high &lambda;) views of the spread.

## Signal Quality Metrics

We evaluated all four signals using multiple quality metrics applied across different samples to test both in-sample fit and out-of-sample generalization:

**Forecast accuracy** — RMSE, MAE, and MSE between predicted and realized butterfly values. All signals achieved RMSE below 0.1, with close alignment between training and test performance — indicating the models generalize rather than overfit.

**Stationarity** — Augmented Dickey-Fuller tests on the butterfly spreads confirm that the cointegrated combinations are genuinely stationary, validating the Box-Tiao weight estimation.

**Mean-reversion speed** — Half-life of mean reversion, measuring how quickly the spread returns to equilibrium after a deviation. Shorter half-life means faster reversion and more trading opportunities.

**Distribution analysis** — Examining the distribution of signal residuals across all butterflies and signal types to check for skewness, fat tails, or regime-dependent behavior.

Metrics were applied on the last year of Sample B (in-sample) and on **Sample C** (2016-2018, out-of-sample). The half-life increased in Sample C relative to Sample B, indicating slower mean-reversion in the later period — a regime shift that the adaptive EMA-based signals (2 and 3) handled better than the constant-mean Signal 1.

## Key Takeaways

The project demonstrates that classical statistical methods — cointegration, CCA, AR(1) with rolling estimation — remain highly effective for fixed income relative value when properly applied. The Box-Tiao decomposition provides theoretically grounded butterfly weights, the EMA-parameterized signals separate structural from tactical deviations, and the signal combination framework lets you blend multiple time horizons without overfitting. The out-of-sample analysis on Sample C confirms that these methods generalize across market regimes, though with degraded mean-reversion speed that the quality metrics clearly flag.

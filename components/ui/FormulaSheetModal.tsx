'use client';

import React, { useState } from 'react';
import { KatexRenderer } from '@/components/ui/KatexRenderer';
import { cn } from '@/lib/utils';

export function FormulaSheetModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSheet, setActiveSheet] = useState<1 | 2 | 3>(3);
  const [search, setSearch] = useState('');

  return (
    <>
      {/* Floating Quick-Access Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-2xl shadow-indigo-600/50 flex items-center gap-2.5 transition-all duration-200 hover:scale-105 border border-indigo-400/30"
        aria-label="Open Official Formula Sheets"
      >
        <span className="text-xl">📋</span>
        <span className="text-sm font-semibold tracking-wide">Formula Sheets</span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-800 bg-gray-950/80">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📋</span>
                <div>
                  <h2 className="text-lg font-bold text-white leading-tight">
                    UF STA3032 Official Formula Sheets
                  </h2>
                  <p className="text-xs text-gray-400">
                    Instantly expand & reference without leaving your current question.
                  </p>
                </div>
              </div>

              {/* Sheet Switcher Tabs */}
              <div className="flex items-center gap-1.5 bg-gray-800/80 p-1 rounded-xl border border-gray-700">
                {([1, 2, 3] as const).map((num) => (
                  <button
                    key={num}
                    onClick={() => setActiveSheet(num)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                      activeSheet === num
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-white',
                    )}
                  >
                    Exam {num} Sheet
                  </button>
                ))}
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors text-lg"
                aria-label="Close formula sheets"
              >
                ✕
              </button>
            </div>

            {/* Quick Search & Actions Bar */}
            <div className="px-5 py-3 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between gap-4 flex-wrap text-xs">
              <input
                type="text"
                placeholder="Quick-filter formulas in this sheet (e.g. slope, ANOVA, Welch, Bayes)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-[240px] bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <div className="flex items-center gap-3">
                <a
                  href={`/formula-sheets/exam-${activeSheet}.pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  <span>↗ Open Official PDF</span>
                </a>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {activeSheet === 1 && <Exam1SheetView filter={search} />}
              {activeSheet === 2 && <Exam2SheetView filter={search} />}
              {activeSheet === 3 && <Exam3SheetView filter={search} />}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800 bg-gray-950/80 flex items-center justify-between text-xs text-gray-500">
              <span>
                Tip: Only Exam 3 sheet is officially provided on final exam day. Use the Note Sheet Studio for missing formulas!
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Exam 1 Content ─────────────────────────────────────────────────────────────
function Exam1SheetView({ filter }: { filter: string }) {
  const items = [
    {
      title: 'Sample Variance s²',
      latex: 's^2 = \\frac{1}{n-1} \\sum_{i=1}^n (x_i - \\bar{x})^2 = \\frac{\\sum x_i^2 - n\\bar{x}^2}{n-1}',
      vars: 'n = sample size, x_i = i-th observation, x̄ = sample mean, df = n - 1',
    },
    {
      title: 'Sample p-th Percentile Interpolation',
      latex: 'R = \\frac{p}{100}(n+1), \\quad \\tilde{x}_{p/100} = (R - \\lfloor R \\rfloor)(x_{\\lfloor R \\rfloor + 1} - x_{\\lfloor R \\rfloor}) + x_{\\lfloor R \\rfloor}',
      vars: 'p = target percentile (0-100), R = rank index, ⌊R⌋ = integer floor',
    },
    {
      title: 'Interquartile Range & 1.5×IQR Outlier Rule',
      latex: 'IQR = Q_3 - Q_1, \\quad \\text{Outlier if } x < Q_1 - 1.5(IQR) \\text{ or } x > Q_3 + 1.5(IQR)',
      vars: 'Q₁ = 25th percentile (1st quartile), Q₃ = 75th percentile (3rd quartile)',
    },
    {
      title: "Permutations & Combinations (Counting)",
      latex: '_nP_r = \\frac{n!}{(n-r)!}, \\quad \\binom{n}{r} = \\frac{n!}{r!(n-r)!}',
      vars: 'n = total available distinct items, r = number of items selected (order matters in P, not in C)',
    },
    {
      title: 'Conditional Probability & Multiplication Rule',
      latex: 'P(B \\mid A) = \\frac{P(A \\cap B)}{P(A)}, \\quad P(A \\cap B) = P(A)P(B \\mid A)',
      vars: 'P(A) > 0, P(A ∩ B) = joint probability',
    },
    {
      title: "Theorem of Total Probability & Bayes' Rule",
      latex: 'P(A) = \\sum_{i=1}^k P(B_i)P(A \\mid B_i), \\quad P(B_j \\mid A) = \\frac{P(B_j)P(A \\mid B_j)}{\\sum_{i=1}^k P(B_i)P(A \\mid B_i)}',
      vars: 'B₁...B_k = partition of sample space S, P(B_j) = prior probability, P(B_j|A) = posterior probability',
    },
    {
      title: 'Expected Value & Variance of Linear Combination',
      latex: 'E(aX + bY) = aE(X) + bE(Y), \\quad Var(aX + bY + c) = a^2Var(X) + b^2Var(Y) + 2abCov(X, Y)',
      vars: 'a, b, c = constants. If X and Y are independent, Cov(X,Y) = 0',
    },
    {
      title: 'Covariance & Pearson Correlation Coefficient ρ',
      latex: 'Cov(X, Y) = E(XY) - E(X)E(Y), \\quad \\rho_{XY} = \\frac{Cov(X, Y)}{\\sqrt{Var(X)Var(Y)}}',
      vars: 'ρ ∈ [-1, +1], measures direction and strength of linear relationship',
    },
    {
      title: 'Binomial Distribution Bin(n, p)',
      latex: 'P(X = x) = \\binom{n}{x} p^x (1-p)^{n-x}, \\quad E(X) = np, \\quad Var(X) = np(1-p)',
      vars: 'n = fixed trials, p = probability of success, x = 0, 1, ..., n',
    },
    {
      title: 'Poisson Distribution Poisson(λ)',
      latex: 'P(X = x) = \\frac{\\lambda^x e^{-\\lambda}}{x!}, \\quad E(X) = \\lambda, \\quad Var(X) = \\lambda',
      vars: 'λ = average rate of events over fixed interval of time or space, x = 0, 1, 2, ...',
    },
  ];

  const matched = filter.trim()
    ? items.filter((it) => it.title.toLowerCase().includes(filter.toLowerCase()) || it.vars.toLowerCase().includes(filter.toLowerCase()))
    : items;

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-950/40 border border-blue-800 rounded-xl text-xs text-blue-200">
        <strong>Exam 1 Formula Sheet Coverage:</strong> Descriptive Statistics, Counting Rules, Probability Laws, Bayes Rule, Discrete Distributions (Binomial, Poisson, Geometric, Hypergeometric).
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matched.map((it, idx) => (
          <FormulaBox key={idx} {...it} />
        ))}
      </div>
    </div>
  );
}

// ── Exam 2 Content ─────────────────────────────────────────────────────────────
function Exam2SheetView({ filter }: { filter: string }) {
  const items = [
    {
      title: 'Central Limit Theorem (Sample Mean)',
      latex: '\\bar{X} \\xrightarrow{n \\to \\infty} N\\left(\\mu, \\frac{\\sigma^2}{n}\\right), \\quad Z = \\frac{\\bar{X} - \\mu}{\\sigma/\\sqrt{n}} \\sim N(0, 1)',
      vars: 'μ = population mean, σ = population standard deviation, n ≥ 30 standard benchmark',
    },
    {
      title: 'One-Sample z-test & CI for Mean μ (σ known)',
      latex: '\\bar{x} \\pm z_{\\alpha/2}\\frac{\\sigma}{\\sqrt{n}}, \\quad z = \\frac{\\bar{x} - \\mu_0}{\\sigma/\\sqrt{n}}',
      vars: 'z_{0.025} = 1.96, z_{0.05} = 1.645, z_{0.01} = 2.33',
    },
    {
      title: 'One-Sample t-test & CI for Mean μ (σ unknown)',
      latex: '\\bar{x} \\pm t_{\\alpha/2, n-1}\\frac{s}{\\sqrt{n}}, \\quad t = \\frac{\\bar{x} - \\mu_0}{s/\\sqrt{n}} \\sim t_{n-1}',
      vars: 's = sample standard deviation, df = n - 1',
    },
    {
      title: 'One-Sample Proportion p (Large Sample)',
      latex: '\\hat{p} \\pm z_{\\alpha/2}\\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n}}, \\quad z = \\frac{\\hat{p} - p_0}{\\sqrt{p_0(1-p_0)/n}}',
      vars: 'p̂ = x/n (sample proportion), condition: np₀ ≥ 5 and n(1-p₀) ≥ 5',
    },
    {
      title: 'Inference for Variance σ² (Chi-Square)',
      latex: '\\left(\\frac{(n-1)s^2}{\\chi^2_{\\alpha/2, n-1}}, \\frac{(n-1)s^2}{\\chi^2_{1-\\alpha/2, n-1}}\\right), \\quad \\chi^2 = \\frac{(n-1)s^2}{\\sigma_0^2}',
      vars: 'df = n - 1. CRITICAL: Requires exact population normality!',
    },
    {
      title: 'Pooled Two-Sample t-test (Equal Variances σ₁² = σ₂²)',
      latex: 's_p^2 = \\frac{(n_1-1)s_1^2 + (n_2-1)s_2^2}{n_1+n_2-2}, \\quad t = \\frac{(\\bar{x}_1-\\bar{x}_2) - d_0}{s_p\\sqrt{1/n_1 + 1/n_2}} \\sim t_{n_1+n_2-2}',
      vars: 's_p² = pooled variance estimate, df = n₁ + n₂ - 2',
    },
    {
      title: 'Paired t-test (Dependent / Matched Samples)',
      latex: 'D_i = X_i - Y_i, \\quad \\bar{d} \\pm t_{\\alpha/2, n-1}\\frac{s_d}{\\sqrt{n}}, \\quad t = \\frac{\\bar{d} - d_0}{s_d/\\sqrt{n}}',
      vars: 'n = number of pairs, d̄ = mean of differences, s_d = sample SD of differences, df = n - 1',
    },
    {
      title: 'Two-Proportion Pooled z-test (p₁ - p₂)',
      latex: '\\hat{p} = \\frac{x_1 + x_2}{n_1 + n_2}, \\quad z = \\frac{\\hat{p}_1 - \\hat{p}_2}{\\sqrt{\\hat{p}(1-\\hat{p})(1/n_1 + 1/n_2)}}',
      vars: 'p̂ = pooled success proportion under H₀: p₁ = p₂',
    },
    {
      title: 'F-test for Equality of Two Variances (σ₁² / σ₂²)',
      latex: 'F = \\frac{s_1^2}{s_2^2} \\sim F_{n_1-1, n_2-1}',
      vars: 'Convention: place larger sample variance in numerator so F ≥ 1',
    },
    {
      title: 'Chi-Square Test of Independence (r × c table)',
      latex: 'E_{ij} = \\frac{n_{i\\bullet} n_{\\bullet j}}{n}, \\quad \\chi^2 = \\sum_{i=1}^r \\sum_{j=1}^c \\frac{(O_{ij} - E_{ij})^2}{E_{ij}} \\sim \\chi^2_{(r-1)(c-1)}',
      vars: 'O_ij = observed count, E_ij = expected count under independence (requires E_ij ≥ 5)',
    },
  ];

  const matched = filter.trim()
    ? items.filter((it) => it.title.toLowerCase().includes(filter.toLowerCase()) || it.vars.toLowerCase().includes(filter.toLowerCase()))
    : items;

  return (
    <div className="space-y-4">
      <div className="p-3 bg-amber-950/40 border border-amber-800 rounded-xl text-xs text-amber-200">
        <strong>Exam 2 Formula Sheet Coverage:</strong> CLT, One-Sample (μ, p, σ²), Two-Sample (Pooled t, Paired t, Two Proportions, F-test of variances), Chi-Square Independence.
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matched.map((it, idx) => (
          <FormulaBox key={idx} {...it} />
        ))}
      </div>
    </div>
  );
}

// ── Exam 3 Content ─────────────────────────────────────────────────────────────
function Exam3SheetView({ filter }: { filter: string }) {
  const items = [
    {
      title: 'SLR Model & OLS Least Squares Estimators',
      latex: 'y_i = \\beta_0 + \\beta_1 x_i + \\epsilon_i, \\quad b_1 = \\frac{SS_{xy}}{SS_{xx}} = \\frac{\\sum(x_i-\\bar{x})(y_i-\\bar{y})}{\\sum(x_i-\\bar{x})^2}, \\quad b_0 = \\bar{y} - b_1\\bar{x}',
      vars: 'b₁ = slope estimator (change in y per unit x), b₀ = intercept estimator (predicted y when x = 0)',
    },
    {
      title: 'Inference for Slope β₁ (t-test & 100(1-α)% CI)',
      latex: 't = \\frac{b_1 - \\beta_{10}}{\\sqrt{MSE/SS_{xx}}} \\sim t_{n-2}, \\quad b_1 \\pm t_{\\alpha/2, n-2}\\sqrt{\\frac{MSE}{SS_{xx}}}',
      vars: 'MSE = SSE/(n-2) = residual variance s², SSxx = ∑(x_i - x̄)², df = n - 2',
    },
    {
      title: 'Inference for Intercept β₀ (t-test & CI)',
      latex: 't = \\frac{b_0 - \\beta_{00}}{\\sqrt{MSE(1/n + \\bar{x}^2/SS_{xx})}}, \\quad b_0 \\pm t_{\\alpha/2, n-2}\\sqrt{MSE\\left(\\frac{1}{n} + \\frac{\\bar{x}^2}{SS_{xx}}\\right)}',
      vars: 'Precision of intercept depends heavily on distance of x̄ from 0',
    },
    {
      title: 'Confidence Interval for Mean Response μ_{Y|x₀}',
      latex: '\\hat{y}_0 \\pm t_{\\alpha/2, n-2}\\sqrt{MSE\\left(\\frac{1}{n} + \\frac{(x_0 - \\bar{x})^2}{SS_{xx}}\\right)}',
      vars: 'Estimates the true AVERAGE response across all units at x₀. Narrowest at x₀ = x̄',
    },
    {
      title: 'Prediction Interval (PI) for New Individual y₀ at x₀',
      latex: '\\hat{y}_0 \\pm t_{\\alpha/2, n-2}\\sqrt{MSE\\left(1 + \\frac{1}{n} + \\frac{(x_0 - \\bar{x})^2}{SS_{xx}}\\right)}',
      vars: 'Forecasts ONE SINGLE new unit at x₀. Note the extra + 1 for individual error variance! Strictly wider than CI for mean',
    },
    {
      title: 'MLR Model & ANOVA Sum of Squares Identity',
      latex: 'y_i = \\beta_0 + \\sum_{j=1}^k \\beta_j x_{ji} + \\epsilon_i, \\quad SST = SSR + SSE',
      vars: 'SST = ∑(y_i - ȳ)² (df = n - 1), SSR = ∑(ŷ_i - ȳ)² (df = k), SSE = ∑(y_i - ŷ_i)² (df = n - k - 1)',
    },
    {
      title: 'Overall MLR Model F-test (Omnibus)',
      latex: 'H_0: \\beta_1 = \\beta_2 = \\dots = \\beta_k = 0, \\quad F = \\frac{MSR}{MSE} = \\frac{SSR / k}{SSE / (n - k - 1)} \\sim F_{k, n-k-1}',
      vars: 'k = number of predictors in model, n = total sample size',
    },
  ];

  const matched = filter.trim()
    ? items.filter((it) => it.title.toLowerCase().includes(filter.toLowerCase()) || it.vars.toLowerCase().includes(filter.toLowerCase()))
    : items;

  return (
    <div className="space-y-4">
      <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded-xl text-xs text-emerald-200">
        <strong>Exam 3 Formula Sheet Coverage (Provided on Final Exam):</strong> Basic SLR (b₀, b₁, t-test for β₁, CI for mean response, PI for y₀), and MLR identity SST = SSR + SSE + Overall F-test.
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matched.map((it, idx) => (
          <FormulaBox key={idx} {...it} />
        ))}
      </div>
    </div>
  );
}

function FormulaBox({ title, latex, vars }: { title: string; latex: string; vars: string }) {
  return (
    <div className="bg-gray-950/80 border border-gray-800 rounded-2xl p-4 space-y-2 hover:border-gray-700 transition-colors">
      <h3 className="text-sm font-bold text-white">{title}</h3>
      <div className="py-2 overflow-x-auto text-center bg-gray-900/60 rounded-xl border border-gray-800/80">
        <KatexRenderer latex={latex} display={true} />
      </div>
      <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
        <strong className="text-indigo-400">Variables & Rules:</strong> {vars}
      </p>
    </div>
  );
}

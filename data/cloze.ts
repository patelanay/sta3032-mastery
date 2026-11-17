import type { ClozeExercise } from '@/types';

export const clozeExercises: ClozeExercise[] = [
  {
    id: 'cloze-dt-01',
    module: 4,
    type: 'decision-tree',
    title: 'Two-Sample Mean Comparison: Variance Check Decision Rule',
    template:
      'When comparing means of two independent continuous samples where population standard deviations σ₁ and σ₂ are unknown:\n1. If you can safely assume σ₁² = σ₂² (e.g. F-test p > 0.05 or ratio s_max/s_min < 2), use the [BLANK_0] test with degrees of freedom equal to [BLANK_1].\n2. If variances appear unequal or cannot be assumed equal, use the [BLANK_2] test with degrees of freedom determined by the [BLANK_3] approximation.',
    blanks: [
      { index: 0, answer: 'Pooled', hint: 'The test that combines sample variances into s_p²' },
      { index: 1, answer: 'n1 + n2 - 2', hint: 'Sample sizes minus 2 estimated parameters' },
      { index: 2, answer: 'Welch', hint: 'Named after B. L. Welch (unpooled t-test)' },
      { index: 3, answer: 'Satterthwaite', hint: 'Formula that computes effective fractional degrees of freedom' },
    ],
  },
  {
    id: 'cloze-dt-02',
    module: 6,
    type: 'decision-tree',
    title: 'Comparing Multiple Group Means & Post-Hoc Procedure',
    template:
      'To compare the means of k ≥ 3 independent groups simultaneously, we conduct a [BLANK_0] ANOVA.\nIf the omnibus null hypothesis H₀: μ₁ = μ₂ = ... = μ_k is rejected at significance level α, we perform [BLANK_1] post-hoc pairwise tests to identify which specific pairs differ while controlling the overall family-wise error rate.',
    blanks: [
      { index: 0, answer: 'One-Way', hint: 'Single-factor ANOVA / CRD' },
      { index: 1, answer: 'Tukey HSD', hint: 'Honest Significant Difference test based on the studentized range statistic' },
    ],
  },
  {
    id: 'cloze-dt-03',
    module: 5,
    type: 'decision-tree',
    title: 'Model Selection: Comparing Nested Multiple Regressions',
    template:
      'To formally test whether adding q additional predictor variables to a baseline Multiple Linear Regression significantly improves model fit, we run a [BLANK_0] F-test.\nThe numerator degrees of freedom for this F-statistic equals [BLANK_1], representing the number of dropped parameters, and the denominator degrees of freedom is [BLANK_2], computed from the full model.',
    blanks: [
      { index: 0, answer: 'Partial', hint: 'Tests a subset of regression slopes H₀: β_{g+1} = ... = β_k = 0' },
      { index: 1, answer: 'q', hint: 'The number of additional predictors being tested simultaneously' },
      { index: 2, answer: 'n - k - 1', hint: 'Full model error degrees of freedom' },
    ],
  },
  {
    id: 'cloze-dt-04',
    module: 5,
    type: 'decision-tree',
    title: 'Prediction Interval vs Confidence Interval for Mean Response',
    template:
      'In simple linear regression at predictor value x₀:\n1. To estimate the AVERAGE response of all future units at x₀, we compute the [BLANK_0] for the mean response μ_{Y|x₀}.\n2. To forecast the response for ONE SINGLE new individual observation at x₀, we compute the [BLANK_1].\nBecause of the random error ε₀ inherent in a single unit, the [BLANK_2] is always strictly wider.',
    blanks: [
      { index: 0, answer: 'Confidence Interval', hint: 'Estimates E[Y|x₀] = μ_{Y|x₀}' },
      { index: 1, answer: 'Prediction Interval', hint: 'Forecasts individual observation y₀' },
      { index: 2, answer: 'Prediction Interval', hint: 'Has an additional + 1 term under the radical' },
    ],
  },
  {
    id: 'cloze-dt-05',
    module: 4,
    type: 'decision-tree',
    title: 'Categorical Data: Goodness-of-Fit vs Independence',
    template:
      'When working with categorical data:\n1. If a SINGLE categorical variable is measured and compared to hypothesized theoretical proportions, use the Chi-Square [BLANK_0] test with df = k - 1.\n2. If TWO categorical variables are cross-classified in an r × c table to assess whether they are related, use the Chi-Square Test of [BLANK_1] with df = (r - 1)(c - 1).',
    blanks: [
      { index: 0, answer: 'Goodness-of-Fit', hint: 'Tests whether observed counts match expected distribution' },
      { index: 1, answer: 'Independence', hint: 'Tests H₀: variables are independent (no association)' },
    ],
  },
  {
    id: 'cloze-dt-06',
    module: 2,
    type: 'decision-tree',
    title: 'Discrete Distribution Identification: Counts and Trials',
    template:
      '1. Counting successes in a FIXED number n of independent Bernoulli trials with constant probability p follows a [BLANK_0] distribution.\n2. Counting occurrences of a rare event occurring randomly over a continuous interval of time or space with average rate λ follows a [BLANK_1] distribution.\n3. The waiting time until the FIRST occurrence of a Poisson event follows a continuous [BLANK_2] distribution.',
    blanks: [
      { index: 0, answer: 'Binomial', hint: 'Parameters n and p' },
      { index: 1, answer: 'Poisson', hint: 'Parameter λ' },
      { index: 2, answer: 'Exponential', hint: 'Memoryless continuous distribution' },
    ],
  },
  {
    id: 'cloze-anova-01',
    module: 6,
    type: 'anova-table',
    title: 'CRD One-Way ANOVA Table Completion (k = 3 groups, N = 15)',
    template:
      'Given k = 3 treatments, N = 15 observations total:\n• Treatments SS = 90.00, df = [BLANK_0], MS = [BLANK_1]\n• Error SS = [BLANK_2], df = 12, MS = 15.00\n• Total SS = 270.00, df = 14\n• F-statistic = [BLANK_3]',
    blanks: [
      { index: 0, answer: '2', tolerance: 0.01, hint: 'df_Trt = k - 1 = 3 - 1' },
      { index: 1, answer: '45.00', tolerance: 0.01, hint: 'MSTrt = SSTrt / df_Trt = 90 / 2' },
      { index: 2, answer: '180.00', tolerance: 0.01, hint: 'SSE = SST - SSTrt = 270 - 90' },
      { index: 3, answer: '3.00', tolerance: 0.01, hint: 'F = MSTrt / MSE = 45 / 15' },
    ],
  },
  {
    id: 'cloze-anova-02',
    module: 6,
    type: 'anova-table',
    title: 'RCBD ANOVA Table Completion (k = 4 treatments, b = 5 blocks, N = 20)',
    template:
      'Given k = 4 treatments and b = 5 blocks (N = 20 total observations):\n• Treatments: df = [BLANK_0], SS = 120.00, MS = 40.00, F = [BLANK_1]\n• Blocks: df = 4, SS = 80.00, MS = 20.00\n• Error: df = [BLANK_2], SS = 120.00, MS = 10.00\n• Total: df = 19, SS = [BLANK_3]',
    blanks: [
      { index: 0, answer: '3', tolerance: 0.01, hint: 'df_Trt = k - 1 = 4 - 1' },
      { index: 1, answer: '4.00', tolerance: 0.01, hint: 'F_Trt = MSTrt / MSE = 40 / 10' },
      { index: 2, answer: '12', tolerance: 0.01, hint: 'df_Error = (k - 1)(b - 1) = 3 × 4' },
      { index: 3, answer: '320.00', tolerance: 0.01, hint: 'SST = SSTrt + SSBl + SSE = 120 + 80 + 120' },
    ],
  },
  {
    id: 'cloze-asm-01',
    module: 5,
    type: 'assumption-check',
    title: 'Regression Diagnostics: LINE Assumptions & Transformations',
    template:
      'In Simple Linear Regression:\n1. A funnel or megaphone shape in the Residuals vs Fitted plot indicates a violation of the [BLANK_0] variance assumption (heteroscedasticity).\n2. To stabilize variance when residual spread expands proportionally with the fitted value ŷ, apply a [BLANK_1] transformation to response variable y.\n3. Points sharply bending away from the diagonal line in a Normal QQ-plot indicate non-[BLANK_2] of error terms.',
    blanks: [
      { index: 0, answer: 'Equal', hint: 'The "E" in LINE' },
      { index: 1, answer: 'log', hint: 'ln(y) or log(y) variance-stabilizing transformation' },
      { index: 2, answer: 'normality', hint: 'The "N" in LINE' },
    ],
  },
  {
    id: 'cloze-asm-02',
    module: 4,
    type: 'assumption-check',
    title: 'Chi-Square Test Validity Condition',
    template:
      'For a Chi-Square Test of Independence or Goodness-of-Fit test to be statistically valid with reliable p-values, the EXPECTED frequency in every cell must be at least [BLANK_0].\nIf this condition fails, categories must be combined or an exact test (such as [BLANK_1] Exact Test) should be used.',
    blanks: [
      { index: 0, answer: '5', tolerance: 0.01, hint: 'Standard expected cell count threshold' },
      { index: 1, answer: 'Fisher', hint: 'Exact hypergeometric test for contingency tables' },
    ],
  },
];

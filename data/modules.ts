export interface ModuleDefinition {
  number: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  lectures: string;
  examWeight: 'Critical' | 'High' | 'Medium' | 'Low';
  onExam3Sheet: boolean;
  color: string;
  topics: string[];
  keyFormulaIds: string[];
}

export const moduleDefinitions: ModuleDefinition[] = [
  {
    number: 1,
    title: 'Data & Summary Plots',
    lectures: 'L01–L02',
    examWeight: 'Low',
    onExam3Sheet: false,
    color: '#3b82f6', // blue
    topics: [
      'Sample mean and sample variance s²',
      'p-th percentile interpolation (sample percentiles)',
      'Interquartile Range (IQR = Q3 - Q1)',
      '1.5 × IQR outlier detection rule',
      'Boxplots, histograms, and skewness interpretation',
    ],
    keyFormulaIds: ['sample-variance', 'iqr-calc', 'percentile-interp'],
  },
  {
    number: 2,
    title: 'Probability & Random Variables',
    lectures: 'L03–L13',
    examWeight: 'High',
    onExam3Sheet: false,
    color: '#a855f7', // purple
    topics: [
      'Combinatorics: permutations, combinations, partitions',
      'Conditional probability and independence',
      "Bayes' Rule and Law of Total Probability",
      'Joint, marginal, and conditional PMFs / PDFs',
      'Expectation E[X], Variance Var(X), and Covariance Cov(X,Y)',
      'Discrete RVs: Binomial, Poisson, Geometric, Hypergeometric',
      'Continuous RVs: Uniform, Exponential, Normal',
      'Central Limit Theorem (CLT) & QQ-plots for normality',
    ],
    keyFormulaIds: ['bayes-rule', 'clt', 'poisson-pmf', 'exponential-cdf', 'variance-linear-comb'],
  },
  {
    number: 3,
    title: 'One-Sample Inference',
    lectures: 'L14–L18',
    examWeight: 'Medium',
    onExam3Sheet: false,
    color: '#06b6d4', // cyan
    topics: [
      'z Confidence Interval and Hypothesis Test for μ (σ known)',
      'One-sample t-test and CI for μ (σ unknown)',
      'Upper and lower one-sided confidence bounds',
      'Large-sample z-test and Wilson/Wald CI for proportion p',
      'Chi-Square test and CI for population variance σ²',
      'Nonparametric Sign test and Wilcoxon signed-rank test',
    ],
    keyFormulaIds: ['t-ci-mean', 'prop-z-test', 'chisq-variance'],
  },
  {
    number: 4,
    title: 'Two-Sample Inference & Contingency Tables',
    lectures: 'L19–L23',
    examWeight: 'High',
    onExam3Sheet: false,
    color: '#f59e0b', // amber
    topics: [
      'Pooled Two-Sample t-test (assumes equal variances σ₁² = σ₂²)',
      'Welch Two-Sample t-test (unequal variances, Satterthwaite df)',
      'Paired t-test on differences D = X - Y (dependent samples)',
      'Two-proportion z-interval and pooled z-test for p₁ - p₂',
      'F-test for equality of two variances σ₁² / σ₂²',
      'Wilcoxon Rank-Sum (Mann-Whitney) test',
      'Chi-Square Goodness-of-Fit (GOF) test',
      'Chi-Square Test of Independence (r × c contingency tables)',
    ],
    keyFormulaIds: ['welch-t', 'pooled-t', 'paired-t', 'chisq-indep', 'two-prop-z'],
  },
  {
    number: 5,
    title: 'Linear Regression (SLR & MLR)',
    lectures: 'L24–L29',
    examWeight: 'Critical',
    onExam3Sheet: false, // only basic SLR on sheet
    color: '#f43f5e', // rose/red
    topics: [
      'Simple Linear Regression (SLR) OLS estimates b₀ and b₁',
      'Hypothesis testing and CI for slope β₁',
      'Confidence Interval for Mean Response μ_{Y|x₀} vs Prediction Interval for y₀',
      'LINE regression assumptions, residual plots & power transformations (Tukey ladder)',
      'Multiple Linear Regression (MLR): matrix form and ANOVA decomposition (SST = SSR + SSE)',
      'Individual t-tests for predictors vs Partial F-test for subset of predictors',
      'Coefficient of determination R² vs Adjusted R²_adj',
      'Akaike Information Criterion (AIC = n ln(SSE/n) + 2(k+1))',
      'Qualitative / dummy variable coding and interaction terms',
    ],
    keyFormulaIds: ['slr-b1', 'mean-ci', 'pred-pi', 'partial-f', 'r2-adj', 'aic'],
  },
  {
    number: 6,
    title: 'Design of Experiments & ANOVA',
    lectures: 'L30–L32',
    examWeight: 'Medium',
    onExam3Sheet: false,
    color: '#10b981', // emerald
    topics: [
      'Completely Randomized Design (CRD / One-Way ANOVA)',
      'Partitioning sum of squares: SST = SSTrt + SSE',
      'ANOVA table construction (df, SS, MS, F-statistic)',
      'Post-Hoc pairwise comparisons: Tukey HSD and Bonferroni adjustment',
      'Randomized Complete Block Design (RCBD) ANOVA (SST = SSTrt + SSBl + SSE)',
      'Blocking efficiency and reduction of error variance',
    ],
    keyFormulaIds: ['crd-f', 'rcbd-f', 'tukey-hsd'],
  },
];

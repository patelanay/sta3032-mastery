import type { ScenarioCard } from '@/types';

export const scenarios: ScenarioCard[] = [
  {
    id: 'sc-01',
    module: 4,
    scenario:
      'A biomedical engineer tests whether a new anti-inflammatory gel reduces joint swelling in arthritis patients. The joint circumference (in mm) of 18 patients is measured BEFORE applying the gel and AFTER 3 weeks of daily use. The same 18 patients provide both measurements.',
    correctTest: 'Paired Two-Sample t-test',
    wrongOptions: [
      'Welch Two-Sample t-test',
      'Pooled Two-Sample t-test',
      'One-Way ANOVA (CRD)',
    ],
    whyCorrect:
      'The same subjects are measured twice (before and after), making the two groups of observations naturally paired and dependent. You must analyze the single sample of differences D = After - Before using a one-sample t-test on D̄.',
    keySignals: [
      '"same 18 patients measured twice" → matched pairs / dependent samples',
      '"before and after" setup → test difference D = X₂ - X₁',
      'Continuous quantitative response (joint circumference in mm)',
    ],
    assumptions: [
      'Differences D = X₂ - X₁ are approximately normally distributed (or check normal QQ-plot of differences)',
      'Pairs of subjects are independent of one another',
    ],
  },
  {
    id: 'sc-02',
    module: 4,
    scenario:
      'An industrial engineer compares the tensile strength of steel bolts produced by two different suppliers (Supplier A: n₁ = 15, x̄₁ = 520 MPa, s₁ = 18 MPa; Supplier B: n₂ = 12, x̄₂ = 495 MPa, s₂ = 44 MPa). The suppliers operate completely separate foundries with different raw materials. No prior equality of variance can be safely assumed.',
    correctTest: 'Welch Two-Sample t-test (Unequal Variances)',
    wrongOptions: [
      'Pooled Two-Sample t-test',
      'Paired Two-Sample t-test',
      'Chi-Square Test of Independence',
    ],
    whyCorrect:
      'The two samples are independent (two completely different suppliers). The sample standard deviations are substantially different (s₂/s₁ = 44/18 ≈ 2.44 > 2), so assuming equal population variances σ₁² = σ₂² is hazardous. Welch t uses Satterthwaite degrees of freedom without pooling variances.',
    keySignals: [
      'Two independent groups (separate suppliers, distinct batches)',
      'Comparing means of continuous response (tensile strength)',
      'Variances are unknown and unequal (s₂/s₁ > 2 rule-of-thumb)',
    ],
    assumptions: [
      'Both supplier populations are approximately normal (or sample sizes adequate)',
      'Independent random samples from each supplier',
      'Unequal population variances accounted for via Satterthwaite df',
    ],
  },
  {
    id: 'sc-03',
    module: 6,
    scenario:
      'A quality control team at an aerospace firm compares the compressive strength of titanium alloys manufactured under 4 different cooling treatments (Water quench, Oil quench, Air cool, Cryogenic). 6 test specimens are randomly allocated to each of the 4 treatments, and compressive strength is recorded for all 24 specimens.',
    correctTest: 'One-Way ANOVA (Completely Randomized Design / CRD)',
    wrongOptions: [
      'Multiple independent two-sample t-tests',
      'Randomized Complete Block Design (RCBD)',
      'Linear Regression with cooling rate as predictor',
    ],
    whyCorrect:
      'We are comparing means across k = 4 independent categorical treatment groups. Running 6 pairwise t-tests would severely inflate the family-wise Type I error rate (1 - 0.95⁶ ≈ 26.5%). CRD One-Way ANOVA tests H₀: μ₁ = μ₂ = μ₃ = μ₄ simultaneously using the F-statistic (MSTrt / MSE).',
    keySignals: [
      'Comparing means across 3 or more groups (k = 4 treatments)',
      'One categorical factor (cooling method) with completely random specimen assignment',
      'Continuous quantitative response variable',
    ],
    assumptions: [
      'Errors ε_ij are normally distributed (Normal QQ-plot of residuals)',
      'Homoscedasticity: equal variances σ₁² = σ₂² = σ₃² = σ₄² across all groups (Residuals vs Fitted plot)',
      'Mutual independence of all 24 observations',
    ],
  },
  {
    id: 'sc-04',
    module: 6,
    scenario:
      'Following a One-Way ANOVA on the 4 titanium cooling methods where H₀ was rejected at α = 0.05 (F = 7.82, p = 0.001), the metallurgist wants to determine specifically WHICH pairs of cooling methods have significantly different mean strengths, while controlling overall family-wise error at 0.05.',
    correctTest: 'Tukey HSD Post-Hoc Pairwise Comparisons',
    wrongOptions: [
      'Repeated standard two-sample t-tests without correction',
      'Chi-Square Goodness-of-Fit Test',
      'Partial F-test',
    ],
    whyCorrect:
      'Once ANOVA establishes that at least one treatment mean differs, Tukey Honest Significant Difference (HSD) evaluates all pairwise differences |ȳ_i - ȳ_j| against the studentized range critical value q_{α,k,N-k}√(MSE/n), strictly preserving the family-wise error rate at α.',
    keySignals: [
      'ANOVA already rejected omnibus null H₀: all means equal',
      'Objective: identify which specific pairs differ',
      'Equal group sample sizes (or Tukey-Kramer for unequal) with controlled error',
    ],
    assumptions: [
      'Same assumptions as CRD ANOVA (normality, homogeneity of variance)',
      'Pairwise confidence interval contains 0 ⟹ no significant difference between that pair',
    ],
  },
  {
    id: 'sc-05',
    module: 4,
    scenario:
      'A survey of 250 software engineers records two attributes for each engineer: Primary IDE used (VS Code, IntelliJ, Neovim, Eclipse) and Preferred Work Arrangement (Remote, Hybrid, In-Office). The team wants to test whether preferred work arrangement is statistically associated with IDE choice.',
    correctTest: 'Chi-Square Test of Independence (Contingency Table)',
    wrongOptions: [
      'Chi-Square Goodness-of-Fit Test',
      'One-Way ANOVA',
      'Two-Proportion Pooled z-test',
    ],
    whyCorrect:
      'Both variables (IDE and Work Arrangement) are categorical. Observations form an r × c contingency table (4 × 3). The test evaluates H₀: IDE and Work Arrangement are independent vs Hₐ: they are dependent, using χ² = ∑(O - E)²/E with df = (r-1)(c-1) = 6.',
    keySignals: [
      'Two categorical variables observed on each individual in a single random sample',
      'Question asks about "association" or "independence" between variables',
      'Data arranged in a two-way cross-tabulation table',
    ],
    assumptions: [
      'All expected cell counts E_ij = (Row Total × Column Total) / Grand Total ≥ 5',
      'Random sampling from the population of interest',
    ],
  },
  {
    id: 'sc-06',
    module: 5,
    scenario:
      'A structural engineer has data on n = 28 concrete bridge piers with response y = compressive strength (MPa) and predictors x₁ = water-cement ratio, x₂ = aggregate volume fraction, x₃ = curing age (days), and x₄ = silica fume content (%). They want to determine if adding silica fume (x₄) and aggregate fraction (x₂) provides a statistically significant improvement over a model containing only water-cement ratio (x₁) and curing age (x₃).',
    correctTest: 'Partial F-test (Nested Model Comparison)',
    wrongOptions: [
      'Individual t-tests for β₂ and β₄ looked at separately',
      'One-Way ANOVA F-test',
      'Adjusted R² comparison without significance test',
    ],
    whyCorrect:
      'We are testing a composite null hypothesis H₀: β₂ = β₄ = 0 (a subset of 2 coefficients simultaneously equal 0) in a Multiple Linear Regression model. Looking at individual t-tests ignores collinearity between x₂ and x₄. The Partial F-statistic F = ((SSE_R - SSE_F)/2) / MSE_F follows an F(2, n - k - 1) distribution under H₀.',
    keySignals: [
      'MLR model with multiple continuous/indicator predictors',
      'Testing whether a SUBSET of predictors (k - g > 1) can be dropped simultaneously',
      'Comparing Reduced model SSE_R against Full model SSE_F',
    ],
    assumptions: [
      'LINE assumptions hold for the Full model',
      'Reduced model is strictly nested within Full model',
      'F > 1 does not guarantee significance; evaluate F against F_{α, q, n-k-1}',
    ],
  },
  {
    id: 'sc-07',
    module: 5,
    scenario:
      'An environmental sensor firm fits a Simple Linear Regression relating sensor voltage output (x) to ambient particulate concentration (y). The plant manager wants to forecast the particulate concentration for A SINGLE specific sensor unit installed tomorrow whose voltage reading is x₀ = 3.5 V, and provide a 95% bound for that single unit.',
    correctTest: 'Prediction Interval (PI) for an Individual Response y₀',
    wrongOptions: [
      'Confidence Interval for the Mean Response μ_{Y|x₀}',
      'One-Sample t Confidence Interval',
      'Tolerance Interval',
    ],
    whyCorrect:
      'The goal is predicting a single future individual realization y₀ at x₀, NOT the average response across all sensors at x₀. The Prediction Interval includes the additional variance of the individual error term (+1 under the radical): ŷ₀ ± t·√(MSE · (1 + 1/n + (x₀ - x̄)²/SSxx)), making it strictly wider than the CI for mean response.',
    keySignals: [
      '"single specific unit" / "individual reading tomorrow" ⟹ Prediction Interval',
      'Contrasts with "average / mean response for all units" ⟹ Confidence Interval',
      'Formula has "+ 1" inside the standard error square root',
    ],
    assumptions: [
      'Normality of individual errors ε₀ ~ N(0, σ²) is crucial for PI validity',
      'Constant variance σ² across all values of x',
      'The future observation is independent of the n observations used to fit the line',
    ],
  },
  {
    id: 'sc-08',
    module: 2,
    scenario:
      'A cybersecurity scanner flags software packages for malicious code. Historical data shows 0.5% of submitted packages are truly malicious. If a package is malicious, the scanner flags it 98% of the time. If clean, the scanner incorrectly flags it 3% of the time (false positive). A newly uploaded package is flagged. What is the probability it is ACTUALLY malicious?',
    correctTest: "Bayes' Rule (Inverting Conditional Probability)",
    wrongOptions: [
      'Binomial PMF Calculation',
      'Two-Proportion z-test',
      'Poisson Arrival Probability',
    ],
    whyCorrect:
      'We are given the likelihood P(Flag | Malicious) = 0.98 and prior P(Malicious) = 0.005, and need the posterior inverse conditional probability P(Malicious | Flag). By Bayes Rule: P(M|F) = P(F|M)P(M) / [P(F|M)P(M) + P(F|Clean)P(Clean)] = (0.98×0.005) / (0.98×0.005 + 0.03×0.995) ≈ 14.1%.',
    keySignals: [
      'Given conditional probability P(B|A) and priors P(A), asked to find P(A|B)',
      'Rare condition (base rate 0.5%) + false positive rate',
      '"Given that it was flagged, what is the probability it is actually..."',
    ],
    assumptions: [
      'Mutually exclusive and exhaustive partition: Malicious vs Clean',
      'False positive rate and sensitivity apply uniformly',
    ],
  },
  {
    id: 'sc-09',
    module: 2,
    scenario:
      'High-voltage cables experience microscopic insulation breakdowns at an average rate of 1.6 breakdowns per 100 meters. An electrical engineer inspects a 250-meter cable segment and wants to compute the probability of finding AT LEAST 3 breakdowns in that specific length.',
    correctTest: 'Poisson Distribution (Scaled Rate Parameter λ)',
    wrongOptions: [
      'Binomial Distribution',
      'Exponential Distribution',
      'Geometric Distribution',
    ],
    whyCorrect:
      'Insulation breakdowns are rare point events occurring continuously in physical space (length). The rate scales proportionally: λ = 1.6 per 100 m ⟹ for 250 m, λ = 1.6 × (250/100) = 4.0. Probability P(X ≥ 3) = 1 - [P(X=0) + P(X=1) + P(X=2)] using Poisson PMF P(X=x) = e^{-λ} λ^x / x! with λ = 4.',
    keySignals: [
      'Counts of occurrences over a continuous interval of space/length or time',
      'Average rate λ provided (must be rescaled to target interval)',
      '"at least k breakdowns" ⟹ complement rule 1 - P(X < k)',
    ],
    assumptions: [
      'Breakdowns occur independently in disjoint segments',
      'Probability of multiple breakdowns in an infinitesimal length is negligible',
      'Average breakdown rate is constant along the entire cable',
    ],
  },
  {
    id: 'sc-010',
    module: 5,
    scenario:
      'In a regression model predicting fuel consumption (y) from vehicle speed (x), the analyst plots residuals e_i versus fitted values ŷ_i. The plot exhibits a pronounced funnel shape: residual dispersion is very narrow at low fitted values and fans out widely at high fitted values.',
    correctTest: 'Heteroscedasticity Diagnosis ⟹ Variance-Stabilizing Transformation (e.g. log(y) or √y)',
    wrongOptions: [
      'Polynomial Regression (adding x² for non-linearity)',
      'Removing outliers via 1.5×IQR rule',
      'Switching to Chi-Square Test',
    ],
    whyCorrect:
      'A funnel / fan-shaped pattern in the Residuals vs Fitted plot is the classic diagnostic signature of heteroscedasticity (violation of the "Equal Variance" E in LINE assumptions). To stabilize variance when error spread grows with the mean, a concave power transformation on y such as ln(y) or √y is required.',
    keySignals: [
      'Residuals vs Fitted plot exhibits expanding funnel / fan shape',
      'Spread of errors depends on fitted value (mean response)',
      'Violates LINE Equal variance condition',
    ],
    assumptions: [
      'Power transformation on y stabilizes variance across levels of ŷ',
      'Must re-fit regression on transformed variable and re-inspect diagnostic plots',
    ],
  },
  {
    id: 'sc-011',
    module: 6,
    scenario:
      'An agricultural engineer evaluates 3 nitrogen fertilizer blends on crop yield. Because soil moisture varies heavily from north to south across the test plot, the field is partitioned into 5 distinct moisture zones (blocks). Each blend is tested once inside each of the 5 zones, so each block contains all 3 blends.',
    correctTest: 'Randomized Complete Block Design (RCBD) ANOVA',
    wrongOptions: [
      'Completely Randomized Design (CRD One-Way ANOVA)',
      'Two-Way Factorial ANOVA with interaction',
      'Paired t-test',
    ],
    whyCorrect:
      'Experimental units are grouped into homogeneous blocks (moisture zones) to control for known nuisance variation. Each treatment appears exactly once per block. The model decomposes total variation into SST = SSTrt + SSBl + SSE, removing block variability from SSE and boosting statistical power to detect fertilizer differences.',
    keySignals: [
      'Presence of a known nuisance/extraneous factor (soil moisture zone)',
      '"Blocks" partitioned to make units within blocks as homogeneous as possible',
      'Every treatment tested in every block (complete design)',
    ],
    assumptions: [
      'No interaction between treatments and blocks (additive model: y_ij = μ + τ_i + β_j + ε_ij)',
      'Errors ε_ij ~ N(0, σ²) are independent with constant variance',
      'df_Trt = k - 1, df_Bl = b - 1, df_Error = (k - 1)(b - 1)',
    ],
  },
  {
    id: 'sc-012',
    module: 3,
    scenario:
      'A pharmaceutical quality manager checks if 500 mg acetaminophen tablets meet weight specifications. A random sample of n = 14 tablets yields a sample mean weight of 503.2 mg with sample standard deviation s = 4.1 mg. The population standard deviation σ is unknown. They want to test H₀: μ = 500 mg at α = 0.01.',
    correctTest: 'One-Sample t-test for Population Mean μ',
    wrongOptions: [
      'One-Sample z-test',
      'Chi-Square test for variance',
      'Sign test',
    ],
    whyCorrect:
      'We have a single quantitative sample from a continuous population, testing a claim about the population mean μ. The population standard deviation σ is unknown and must be estimated by s, and the sample size is small (n = 14 < 30). Therefore, the test statistic follows a Student t-distribution with df = n - 1 = 13.',
    keySignals: [
      'Single sample of size n = 14',
      'Population standard deviation σ is UNKNOWN; sample s provided',
      'Testing claim about mean μ (H₀: μ = μ₀)',
    ],
    assumptions: [
      'Tablet weights are approximately normally distributed (critical when n < 30)',
      'Sample is a simple random sample from the manufacturing batch',
    ],
  },
];

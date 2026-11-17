import type { WalkthroughProblem } from '@/types';

export const walkthroughs: WalkthroughProblem[] = [
  {
    id: 'wt-01',
    source: 'PF1-Q1',
    module: 5,
    title: 'Simple Linear Regression: Structural Beam Deflection & Hypothesis Test',
    context:
      'A civil engineering lab tests n = 20 steel beams under uniform center-load x (kN) and measures maximum deflection y (mm). Summary statistics computed from the experiment:\n• n = 20, x̄ = 15.0 kN, ȳ = 8.5 mm\n• SSxx = 250.0, SSyy = 180.0, SSxy = 175.0\nConduct a complete regression analysis at α = 0.05 and construct a 95% Confidence Interval for the mean deflection of beams loaded at x₀ = 18.0 kN.',
    stages: [
      {
        stageNum: 1,
        label: 'Identify Statistical Model & Estimators',
        prompt:
          'What is the appropriate statistical model and which sample estimators are used to fit the relationship?',
        hint: 'Single continuous predictor (load x) and single continuous response (deflection y). Formula sheet provides b₁ and b₀.',
        answer: 'Simple Linear Regression (SLR): y = β₀ + β₁x + ε. Compute b₁ = SSxy/SSxx and b₀ = ȳ - b₁x̄.',
        answerLatex: 'b_1 = \\frac{SS_{xy}}{SS_{xx}} = \\frac{175.0}{250.0} = 0.70, \\quad b_0 = \\bar{y} - b_1\\bar{x} = 8.5 - 0.70(15.0) = -2.0',
        explanation:
          'Because load is a quantitative continuous variable predicting continuous deflection, Simple Linear Regression is the correct framework. The least squares line is ŷ = -2.0 + 0.70x.',
      },
      {
        stageNum: 2,
        label: 'State Hypotheses & Model Assumptions',
        prompt:
          'State the null and alternative hypotheses to test whether applied load significantly predicts beam deflection, and state the LINE assumptions.',
        hint: 'Null states no linear association (slope is zero). Alternative is two-sided unless directional prior exists.',
        answer: 'H₀: β₁ = 0 vs Hₐ: β₁ ≠ 0. Assumptions: LINE (Linear relation, Independent errors, Normal errors, Equal variance).',
        answerLatex: 'H_0: \\beta_1 = 0 \\quad \\text{vs} \\quad H_a: \\beta_1 \\neq 0',
        explanation:
          'Testing H₀: β₁ = 0 determines if the linear predictor has explanatory power. We check LINE via residual plots.',
      },
      {
        stageNum: 3,
        label: 'Compute Sums of Squares & Standard Error',
        prompt:
          'Calculate SSR, SSE, MSE = s², and the standard error of slope estimator SE(b₁).',
        hint: 'SSR = b₁·SSxy, SSE = SSyy - SSR, MSE = SSE/(n-2), SE(b₁) = √(MSE/SSxx).',
        answer: 'SSR = 122.50, SSE = 57.50, df = 18, MSE = 3.194, SE(b₁) = 0.1130.',
        answerLatex: 'SSE = 180.0 - 0.70(175.0) = 57.50, \\quad MSE = \\frac{57.50}{18} = 3.1944, \\quad SE(b_1) = \\sqrt{\\frac{3.1944}{250.0}} = 0.1130',
        explanation:
          'The error degrees of freedom is n - 2 = 18 because two parameters (β₀, β₁) are estimated from the data.',
      },
      {
        stageNum: 4,
        label: 'Calculate Test Statistic & Decision',
        prompt:
          'Compute the t-test statistic for slope β₁ and compare against the critical value at α = 0.05.',
        hint: 't = b₁ / SE(b₁). Critical value comes from t-distribution with df = 18 at α/2 = 0.025.',
        answer: 't = 0.70 / 0.1130 = 6.19. Critical value t_{0.025, 18} = 2.101. Reject H₀.',
        answerLatex: 't = \\frac{b_1 - 0}{SE(b_1)} = \\frac{0.70}{0.1130} = 6.19 > t_{0.025, 18} = 2.101 \\implies \\text{Reject } H_0',
        explanation:
          'Since |t| = 6.19 is far greater than the critical value 2.101 (p < 0.0001), we decisively reject the null hypothesis of no relationship.',
      },
      {
        stageNum: 5,
        label: '95% CI for Mean Response at x₀ = 18.0 kN & Context Conclusion',
        prompt:
          'Construct the 95% Confidence Interval for the mean deflection μ_{Y|x₀} at x₀ = 18.0 kN and state conclusion in context.',
        hint: 'ŷ₀ = -2.0 + 0.70(18) = 10.60 mm. SE = √(MSE · (1/n + (x₀ - x̄)²/SSxx)).',
        answer: 'ŷ₀ = 10.60 mm. Margin of Error = 2.101 × 0.4632 = 0.973 mm. 95% CI: (9.63 mm, 11.57 mm).',
        answerLatex: '\\hat{y}_0 \\pm t_{0.025, 18}\\sqrt{MSE\\left(\\frac{1}{20} + \\frac{(18.0 - 15.0)^2}{250.0}\\right)} = 10.60 \\pm 0.973 = (9.63, 11.57)',
        explanation:
          'We are 95% confident that the true average deflection for all steel beams subjected to an 18.0 kN load is between 9.63 mm and 11.57 mm.',
      },
    ],
  },
  {
    id: 'wt-02',
    source: 'PF2-Q2',
    module: 4,
    title: 'Contingency Table Analysis: Chip Packaging Defects & Shift Independence',
    context:
      'A semiconductor manufacturing plant records integrated circuit packaging defects across three work shifts (Morning, Afternoon, Night) in a random sample of 300 inspection lots:\n• Morning Shift: 15 Defective, 85 Acceptable (100 total)\n• Afternoon Shift: 22 Defective, 78 Acceptable (100 total)\n• Night Shift: 35 Defective, 65 Acceptable (100 total)\nGrand total: 72 Defective, 228 Acceptable (N = 300). Test at α = 0.01 whether defect rates are independent of work shift.',
    stages: [
      {
        stageNum: 1,
        label: 'Identify Statistical Test',
        prompt: 'Identify the appropriate statistical test for this 3 × 2 table.',
        hint: 'Two categorical attributes: Shift (3 levels) and Defect Status (2 levels).',
        answer: 'Chi-Square Test of Independence on a 3 × 2 contingency table.',
        explanation: 'Both Shift and Quality are categorical classifications evaluated from a single sample of 300 lots.',
      },
      {
        stageNum: 2,
        label: 'State Hypotheses & Verify Conditions',
        prompt: 'State H₀ and Hₐ and verify the sample size requirements.',
        hint: 'H₀ states independence. Expected cell count rule: all E_ij ≥ 5.',
        answer: 'H₀: Shift and Defect status are independent. Hₐ: Shift and Defect status are dependent. Min expected count = 100 × 72 / 300 = 24.0 ≥ 5.',
        explanation: 'All 6 expected counts are either 24.0 or 76.0, well above the threshold of 5.',
      },
      {
        stageNum: 3,
        label: 'Calculate Expected Counts & χ² Components',
        prompt: 'Compute the Chi-Square test statistic χ² = ∑(O - E)²/E.',
        hint: 'E_Defective = 24.0 for all shifts. E_Acceptable = 76.0 for all shifts.',
        answer: 'χ² = (15-24)²/24 + (85-76)²/76 + (22-24)²/24 + (78-76)²/76 + (35-24)²/24 + (65-76)²/76 = 3.375 + 1.066 + 0.167 + 0.053 + 5.042 + 1.592 = 11.295.',
        answerLatex: '\\chi^2 = \\sum \\frac{(O_{ij} - E_{ij})^2}{E_{ij}} = 11.30',
        explanation: 'The night shift contributes the vast majority of the test statistic (5.042 + 1.592 = 6.634).',
      },
      {
        stageNum: 4,
        label: 'Determine Degrees of Freedom & Critical Value',
        prompt: 'Find the degrees of freedom and critical value at α = 0.01.',
        hint: 'df = (r - 1)(c - 1) = (3 - 1)(2 - 1). Look up χ² table at α = 0.01.',
        answer: 'df = (3 - 1)(2 - 1) = 2. Critical value χ²_{0.01, 2} = 9.210.',
        answerLatex: 'df = (3-1)(2-1) = 2, \\quad \\chi^2_{0.01, 2} = 9.210 \\implies \\text{Reject } H_0',
        explanation: 'Because observed χ² = 11.30 > 9.210, we reject the null hypothesis of independence.',
      },
      {
        stageNum: 5,
        label: 'Conclusion & Practical Interpretation',
        prompt: 'State the final conclusion in engineering context.',
        hint: 'Explain what rejecting independence means for plant management.',
        answer: 'There is statistically significant evidence at α = 0.01 that packaging defect rates depend on the work shift. The night shift exhibits a substantially elevated defect rate (35% vs 15% morning).',
        explanation: 'Plant management should investigate operational, training, or fatigue factors specific to the night shift.',
      },
    ],
  },
  {
    id: 'wt-03',
    source: 'PF2-Q3',
    module: 6,
    title: 'One-Way ANOVA & Tukey Post-Hoc: Tensile Strength of 3 Composite Resins',
    context:
      'A materials science lab tests the tensile bond strength (MPa) of 3 new dental composite resins (A, B, C). n = 5 test specimens are evaluated per resin (N = 15 total):\n• Resin A: ȳ₁ = 22.4 MPa, s₁² = 3.2\n• Resin B: ȳ₂ = 26.8 MPa, s₂² = 2.8\n• Resin C: ȳ₃ = 31.2 MPa, s₃² = 3.6\nGrand mean ȳ = 26.8 MPa. Test H₀: μ₁ = μ₂ = μ₃ at α = 0.05 and perform Tukey HSD if indicated.',
    stages: [
      {
        stageNum: 1,
        label: 'Identify Model & Test',
        prompt: 'Identify the experimental design and statistical procedure.',
        hint: 'One categorical factor (Resin type, 3 levels) with quantitative continuous response.',
        answer: 'Completely Randomized Design (CRD One-Way ANOVA) with k = 3 groups and n = 5 per group.',
        explanation: 'We test whether the 3 population resin means are identical using the ANOVA F-test.',
      },
      {
        stageNum: 2,
        label: 'State Hypotheses & Compute SSTrt and SSE',
        prompt: 'State H₀ and compute Treatment Sum of Squares (SSTrt) and Error Sum of Squares (SSE).',
        hint: 'SSTrt = n ∑(ȳ_i - ȳ)², SSE = (n-1) ∑ s_i².',
        answer: 'H₀: μ₁ = μ₂ = μ₃ vs Hₐ: at least two means differ. SSTrt = 5 × [(-4.4)² + (0)² + (4.4)²] = 193.6. SSE = 4 × (3.2 + 2.8 + 3.6) = 38.4.',
        answerLatex: 'SS_{Trt} = 5[(22.4-26.8)^2 + 0 + (31.2-26.8)^2] = 193.6, \\quad SSE = 4(3.2+2.8+3.6) = 38.4',
        explanation: 'Degrees of freedom: df_Trt = 3 - 1 = 2; df_Error = 15 - 3 = 12.',
      },
      {
        stageNum: 3,
        label: 'Construct ANOVA Table & Compute F-Ratio',
        prompt: 'Compute MSTrt, MSE, and the F test statistic.',
        hint: 'MSTrt = SSTrt / 2, MSE = SSE / 12, F = MSTrt / MSE.',
        answer: 'MSTrt = 193.6 / 2 = 96.8. MSE = 38.4 / 12 = 3.2. F = 96.8 / 3.2 = 30.25.',
        answerLatex: 'F = \\frac{MS_{Trt}}{MSE} = \\frac{96.80}{3.20} = 30.25',
        explanation: 'The F-ratio is very large, suggesting substantial between-group variation compared to within-group error.',
      },
      {
        stageNum: 4,
        label: 'Statistical Decision at α = 0.05',
        prompt: 'Find critical value F_{0.05, 2, 12} and make decision.',
        hint: 'Look up F table with numerator df = 2 and denominator df = 12 at α = 0.05.',
        answer: 'Critical value F_{0.05, 2, 12} = 3.89. Since F = 30.25 > 3.89, reject H₀ (p < 0.001).',
        explanation: 'We reject the null hypothesis of equal mean strengths. Proceed to Tukey post-hoc.',
      },
      {
        stageNum: 5,
        label: 'Tukey HSD Post-Hoc Pairwise Comparisons',
        prompt:
          'Compute the minimum significant difference (HSD) with q_{0.05, 3, 12} = 3.77 and evaluate all pairs.',
        hint: 'HSD = q · √(MSE / n) = 3.77 · √(3.2 / 5).',
        answer: 'HSD = 3.77 × √(0.64) = 3.77 × 0.80 = 3.016 MPa.\n• |ȳ_B - ȳ_A| = 4.4 > 3.016 (B > A)\n• |ȳ_C - ȳ_B| = 4.4 > 3.016 (C > B)\n• |ȳ_C - ȳ_A| = 8.8 > 3.016 (C > A)\nAll 3 pairs differ significantly: μ_C > μ_B > μ_A.',
        explanation: 'Resin C delivers statistically significantly higher bond strength than both Resin B and Resin A.',
      },
    ],
  },
  {
    id: 'wt-04',
    source: 'HW4-Q2',
    module: 4,
    title: 'Two-Sample Inference: Welch t-test for Heat Exchanger Flow Rates',
    context:
      'An HVAC engineer tests the flow rate (L/min) delivered by two pump models:\n• Model 1: n₁ = 12, x̄₁ = 84.5 L/min, s₁ = 2.1 L/min\n• Model 2: n₂ = 10, x̄₂ = 79.2 L/min, s₂ = 6.4 L/min\nNotice s₂/s₁ ≈ 3.05, so variances cannot be assumed equal. Test H₀: μ₁ = μ₂ at α = 0.05.',
    stages: [
      {
        stageNum: 1,
        label: 'Identify Test Procedure',
        prompt: 'Which two-sample test is appropriate and why?',
        hint: 'Independent groups, continuous response, sample standard deviations differ by more than a factor of 2.',
        answer: 'Welch Two-Sample t-test (unpooled) with Satterthwaite degrees of freedom.',
        explanation: 'Because s₂/s₁ > 2, pooling variances is not justifiable. Welch t does not assume σ₁² = σ₂².',
      },
      {
        stageNum: 2,
        label: 'State Hypotheses & Assumptions',
        prompt: 'State H₀ and Hₐ and check assumptions.',
        hint: 'H₀: μ₁ - μ₂ = 0 vs Hₐ: μ₁ - μ₂ ≠ 0.',
        answer: 'H₀: μ₁ = μ₂ vs Hₐ: μ₁ ≠ μ₂. Assumptions: independent random samples from normally distributed flow rate populations.',
        explanation: 'Both populations are assumed approximately normal since sample sizes are moderate.',
      },
      {
        stageNum: 3,
        label: 'Compute Standard Error & Satterthwaite Degrees of Freedom',
        prompt: 'Calculate SE = √(s₁²/n₁ + s₂²/n₂) and Satterthwaite df ν.',
        hint: 's₁²/n₁ = 4.41/12 = 0.3675. s₂²/n₂ = 40.96/10 = 4.096.',
        answer: 'SE = √(0.3675 + 4.096) = √4.4635 = 2.1127 L/min. df ν ≈ (4.4635)² / [ (0.3675)²/11 + (4.096)²/9 ] ≈ 19.92 / [0.0123 + 1.864] ≈ 10.6 ⟹ truncate to df = 10.',
        answerLatex: 'SE = 2.113, \\quad \\nu = \\frac{(s_1^2/n_1 + s_2^2/n_2)^2}{\\frac{(s_1^2/n_1)^2}{n_1-1} + \\frac{(s_2^2/n_2)^2}{n_2-1}} \\approx 10.6 \\implies df = 10',
        explanation: 'Satterthwaite df is heavily pulled toward the smaller sample with the larger variance (Model 2, n₂ - 1 = 9).',
      },
      {
        stageNum: 4,
        label: 'Compute Test Statistic & Decision',
        prompt: 'Compute t-statistic and compare to critical value at α = 0.05.',
        hint: 't = (x̄₁ - x̄₂) / SE. Critical value t_{0.025, 10} = 2.228.',
        answer: 't = (84.5 - 79.2) / 2.1127 = 5.3 / 2.1127 = 2.509. Critical value t_{0.025, 10} = 2.228. Reject H₀.',
        explanation: 'Since t = 2.509 > 2.228, we reject H₀ at α = 0.05 (p ≈ 0.031).',
      },
      {
        stageNum: 5,
        label: 'Conclusion & 95% Confidence Interval',
        prompt: 'Compute the 95% CI for μ₁ - μ₂ and state conclusion.',
        hint: '(x̄₁ - x̄₂) ± t_{0.025, 10} · SE.',
        answer: '95% CI: 5.3 ± 2.228(2.1127) = 5.3 ± 4.71 = (0.59 L/min, 10.01 L/min). Model 1 delivers a significantly higher flow rate.',
        explanation: 'We are 95% confident that Model 1 provides between 0.59 and 10.01 L/min higher average flow rate than Model 2.',
      },
    ],
  },
];

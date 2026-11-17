export interface CheckpointQuestion {
  id: string;
  question: string;
  questionLatex?: string;
  type: 'scenario' | 'calculation' | 'trap-check';
  options: string[];
  correctIndex: number;
  explanation: string;
  trapWarning: string;
}

export interface ModuleCheckpoint {
  module: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  subtitle: string;
  questions: CheckpointQuestion[];
}

export const moduleCheckpoints: Record<number, ModuleCheckpoint> = {
  1: {
    module: 1,
    title: 'Module 1 Active Recall Capstone: Data & Outlier Mastery',
    subtitle: 'Verify you can spot skewness, compute fences, and choose robust statistics under exam pressure.',
    questions: [
      {
        id: 'cp1-1',
        type: 'scenario',
        question: 'An engineering dataset on metal fatigue cycle life has Mean = 45,000 cycles, Median = 31,000 cycles, and Mode = 24,000 cycles. Which measure of spread is most appropriate, and how is the distribution shaped?',
        options: [
          'Right-skewed; use Mean and Standard Deviation s',
          'Right-skewed; use Median and Interquartile Range (IQR)',
          'Left-skewed; use Median and Interquartile Range (IQR)',
          'Symmetric; use Mean and Variance s²',
        ],
        correctIndex: 1,
        explanation: 'Because Mode (24k) < Median (31k) < Mean (45k), the long tail is to the right (right-skewed). Extreme long-life outliers pull the arithmetic mean and standard deviation upward. The median and IQR are resistant (robust) statistics and accurately represent the central 50% without distortion.',
        trapWarning: 'Never report Mean & s for strongly skewed data—a few extreme points will grossly distort both.',
      },
      {
        id: 'cp1-2',
        type: 'calculation',
        question: 'A sample of 15 turbine blade tolerances yields Q1 = 18.5 mm and Q3 = 26.5 mm. A recorded blade tolerance is 39.0 mm. Is this blade classified as an outlier under Tukey\'s 1.5 × IQR rule?',
        options: [
          'No, the upper fence is 40.5 mm, so 39.0 mm is within normal bounds.',
          'Yes, IQR = 8.0 mm; Upper Fence = 26.5 + 1.5(8.0) = 38.5 mm; 39.0 mm exceeds the fence.',
          'Yes, because any point greater than Q3 is an outlier.',
          'No, 39.0 mm is less than 3 × IQR so it is not an outlier.',
        ],
        correctIndex: 1,
        explanation: 'IQR = Q3 - Q1 = 26.5 - 18.5 = 8.0 mm. Upper fence = Q3 + 1.5(IQR) = 26.5 + 1.5(8.0) = 26.5 + 12.0 = 38.5 mm. Because 39.0 mm > 38.5 mm, it lies strictly beyond the upper fence and is classified as an outlier.',
        trapWarning: 'Make sure you add 1.5(IQR) to Q3 (not Q1 or the median) when finding the upper fence.',
      },
      {
        id: 'cp1-3',
        type: 'trap-check',
        question: 'Why does sample variance s² divide by (n - 1) instead of n, and what is its expected value E[s²]?',
        options: [
          'Dividing by n would overestimate σ²; dividing by n - 1 makes E[s²] = σ².',
          'Because observations are closer to x̄ than to true μ, dividing by n systematically underestimates σ²; dividing by n - 1 corrects the bias so E[s²] = σ².',
          'It is purely a convention for small samples (n < 30) and has no mathematical justification.',
          'Dividing by n - 1 makes s² equal to the population standard deviation σ.',
        ],
        correctIndex: 1,
        explanation: 'Because the sample mean x̄ minimizes the sum of squared deviations Σ(x_i - c)², deviations around x̄ are always smaller than deviations around the true unknown population mean μ. Dividing by n produces negative bias (E[s²_n] = (n-1)/n * σ² < σ²). Dividing by degrees of freedom n - 1 yields an unbiased estimator: E[s²] = σ².',
        trapWarning: 's² is an unbiased estimator of σ², but sample standard deviation s is NOT unbiased for σ due to Jensen\'s inequality (E[s] < σ).',
      },
    ],
  },
  2: {
    module: 2,
    title: 'Module 2 Active Recall Capstone: Probability & Random Variables',
    subtitle: 'Verify Bayes\' Rule, discrete vs continuous properties, and expectation rules.',
    questions: [
      {
        id: 'cp2-1',
        type: 'scenario',
        question: 'A sensor component failure rate is constant at λ = 0.05 failures per hour. The component has already operated continuously for 100 hours without failure. What is the probability it survives at least another 20 hours?',
        options: [
          'P(X > 120) = e^(-0.05 * 120)',
          'P(X > 20 | X > 100) = e^(-0.05 * 20) by the Memoryless Property',
          'P(X > 20) / P(X > 100) = e^(-0.05 * 80)',
          'It is impossible to calculate without knowing the component wear-out degradation curve.',
        ],
        correctIndex: 1,
        explanation: 'Constant failure rate λ implies an Exponential distribution. The Exponential distribution is memoryless: P(X > s + t | X > s) = P(X > t). Having already survived 100 hours does not age the component: P(X > 100 + 20 | X > 100) = P(X > 20) = e^(-0.05 * 20) = e^(-1) ≈ 0.368.',
        trapWarning: 'Do NOT compute P(X > 120). Remember that conditioned on surviving to time s, the clock resets!',
      },
      {
        id: 'cp2-2',
        type: 'calculation',
        question: 'Two random variables X and Y have Var(X) = 4, Var(Y) = 9, and Cov(X,Y) = -2. What is the variance of W = 3X - 2Y?',
        options: [
          'Var(W) = 9(4) + 4(9) - 12(-2) = 36 + 36 + 24 = 96',
          'Var(W) = 9(4) + 4(9) + 12(-2) = 36 + 36 - 24 = 48',
          'Var(W) = 3(4) - 2(9) = -6',
          'Var(W) = 9(4) - 4(9) = 0',
        ],
        correctIndex: 0,
        explanation: 'Var(aX + bY) = a²Var(X) + b²Var(Y) + 2ab*Cov(X,Y). Here a = 3 and b = -2. So a² = 9, b² = (-2)² = 4, and 2ab = 2(3)(-2) = -12. Thus Var(W) = 9(4) + 4(9) + (-12)(-2) = 36 + 36 + 24 = 96.',
        trapWarning: 'Watch the signs! (-2)² is POSITIVE 4, and 2(3)(-2)*(-2) produces a POSITIVE 24 because negative covariance with a negative coefficient adds variance.',
      },
      {
        id: 'cp2-3',
        type: 'trap-check',
        question: 'Under what condition does the Central Limit Theorem (CLT) guarantee that the sample mean x̄ is approximately normally distributed?',
        options: [
          'Only if the parent population X is strictly normal, for any sample size.',
          'For ANY parent distribution with finite mean μ and variance σ², provided sample size n is sufficiently large (typically n ≥ 30).',
          'CLT guarantees that individual raw data points Xi become normally distributed as n increases.',
          'Only for symmetric discrete distributions.',
        ],
        correctIndex: 1,
        explanation: 'CLT states that for ANY population with finite mean μ and variance σ², the sampling distribution of the sample mean x̄ approaches N(μ, σ²/n) as n → ∞. It applies to the statistic x̄, NOT to the raw individual observations X_i.',
        trapWarning: 'Common exam trap: CLT never makes the raw population normal; it only makes the average of random samples normal.',
      },
    ],
  },
  3: {
    module: 3,
    title: 'Module 3 Active Recall Capstone: One-Sample Inference',
    subtitle: 'Verify z vs t decision boundaries, variance CIs, and one-sided bounds.',
    questions: [
      {
        id: 'cp3-1',
        type: 'scenario',
        question: 'A materials lab measures breaking strength of n = 18 ceramic tiles. Population variance σ² is completely unknown. Sample standard deviation is s = 4.2 MPa. An engineer uses Z = (x̄ - μ0)/(s / √18) and critical value 1.96 for a 95% CI. What error was committed?',
        options: [
          'No error; 18 is close enough to 30 to use normal tables.',
          'Fatal error: because σ is unknown and n < 30, Student\'s t-distribution with df = 17 must be used; z produces an overly narrow, anti-conservative interval.',
          'The engineer should have used Chi-Square instead of z or t.',
          'The engineer should have multiplied s by √18 instead of dividing.',
        ],
        correctIndex: 1,
        explanation: 'When population standard deviation σ is unknown and must be estimated by s, the test statistic follows Student\'s t-distribution with ν = n - 1 df, NOT standard normal Z. For n = 18 (df = 17), t_0.025,17 = 2.110, which is significantly wider than z = 1.96. Using z underestimates the true margin of error.',
        trapWarning: 'Lindberg\'s strict rule: If σ is unknown, ALWAYS use t, regardless of sample size!',
      },
      {
        id: 'cp3-2',
        type: 'calculation',
        question: 'When constructing a 95% two-sided confidence interval for population variance σ² from a sample of size n = 20, which Chi-Square critical value appears in the denominator of the LOWER confidence bound?',
        options: [
          'χ²_0.975, 19 (the smaller critical value)',
          'χ²_0.025, 19 (the larger critical value, because dividing by a larger number gives a smaller limit)',
          'z_0.025 = 1.96',
          't_0.025, 19',
        ],
        correctIndex: 1,
        explanation: 'The confidence interval for σ² is [(n - 1)s² / χ²_(α/2, n-1), (n - 1)s² / χ²_(1 - α/2, n-1)]. To find the lower limit, you must divide by the LARGER upper-tail critical value χ²_(0.025, 19). Dividing by the smaller critical value χ²_(0.975, 19) gives the upper limit.',
        trapWarning: 'Students frequently swap the denominators on the Chi-Square variance CI. Larger critical value goes on the left!',
      },
      {
        id: 'cp3-3',
        type: 'trap-check',
        question: 'An environmental agency wants to prove that effluent toxin concentration exceeds the legal limit of 5.0 ppm. How should the null and alternative hypotheses be structured?',
        options: [
          'H0: μ > 5.0 vs Ha: μ ≤ 5.0',
          'H0: μ = 5.0 vs Ha: μ > 5.0 (burden of proof on the claimant in Ha)',
          'H0: μ = 5.0 vs Ha: μ ≠ 5.0',
          'H0: x̄ = 5.0 vs Ha: x̄ > 5.0',
        ],
        correctIndex: 1,
        explanation: 'The research hypothesis to be proven ("toxin exceeds 5.0 ppm") must always be placed in the alternative hypothesis Ha: μ > 5.0. The null hypothesis H0: μ = 5.0 represents the status quo (compliance). Furthermore, hypotheses are ALWAYS stated in terms of population parameters (μ), NEVER sample statistics (x̄).',
        trapWarning: 'Never put sample statistics (x̄ or p̂) in hypothesis statements. Always use Greek population parameters (μ, p, σ).',
      },
    ],
  },
  4: {
    module: 4,
    title: 'Module 4 Active Recall Capstone: Two-Sample Inference & Chi-Square',
    subtitle: 'Verify Welch vs Pooled vs Paired selection and contingency table mechanics.',
    questions: [
      {
        id: 'cp4-1',
        type: 'scenario',
        question: 'An asphalt company tests compressive strength across two independent supplier plants: Plant A (n1 = 12, s1 = 15 MPa) and Plant B (n2 = 14, s2 = 38 MPa). Plant engineers want to test if the two plants produce different mean strengths. Which test must be conducted?',
        options: [
          'Pooled two-sample t-test because both samples are under 30.',
          'Paired t-test because we are comparing two plants.',
          'Welch two-sample t-test with Satterthwaite df because s2/s1 = 38/15 = 2.53 > 2 (unequal variances).',
          'Chi-Square test of independence.',
        ],
        correctIndex: 2,
        explanation: 'The two samples are independent (two separate plants). Because the ratio of sample standard deviations is 38/15 ≈ 2.53 > 2, assuming equal population variances σ1² = σ2² is invalid. Pooling would severely corrupt the Type I error rate. Welch\'s t-test with Satterthwaite degrees of freedom must be used.',
        trapWarning: 'Exam 3 formula sheet does NOT contain Welch\'s test or Satterthwaite df! You must have this formula on your personal note sheet.',
      },
      {
        id: 'cp4-2',
        type: 'calculation',
        question: 'In a 3 × 4 contingency table testing independence between shift (Day, Swing, Night) and defect type (Crack, Dent, Scratch, Void), what are the degrees of freedom for the Chi-Square test?',
        options: [
          'df = 3 × 4 = 12',
          'df = (3 - 1)(4 - 1) = 2 × 3 = 6',
          'df = 12 - 1 = 11',
          'df = 3 + 4 - 2 = 5',
        ],
        correctIndex: 1,
        explanation: 'In an r × c contingency table, degrees of freedom are df = (r - 1)(c - 1). Here r = 3 rows and c = 4 columns, so df = (3 - 1)(4 - 1) = 2 × 3 = 6.',
        trapWarning: 'Do not confuse contingency tables df = (r-1)(c-1) with Goodness-of-Fit df = k - 1 - m.',
      },
      {
        id: 'cp4-3',
        type: 'trap-check',
        question: 'When testing H0: p1 = p2 versus constructing a 95% confidence interval for p1 - p2, how does the standard error calculation differ?',
        options: [
          'Both use the pooled proportion p̄ = (x1 + x2)/(n1 + n2).',
          'The hypothesis test pools proportions under H0: p1 = p2; the confidence interval NEVER pools and uses separate sample proportions p̂1 and p̂2.',
          'The confidence interval pools, but the test does not.',
          'Neither pools; both always use separate sample proportions.',
        ],
        correctIndex: 1,
        explanation: 'Hypothesis testing assumes H0: p1 = p2 = p is true, so the best estimate of the common proportion is the pooled proportion p̄ = (x1 + x2)/(n1 + n2). Confidence intervals do not assume equality—they estimate the magnitude of difference p1 - p2, so each group\'s variance p̂i(1 - p̂i)/ni must be used separately.',
        trapWarning: 'Never use pooled p̄ in a two-proportion confidence interval! Only use it in the hypothesis test statistic.',
      },
    ],
  },
  5: {
    module: 5,
    title: 'Module 5 Active Recall Capstone: Linear Regression (SLR & MLR)',
    subtitle: 'Verify slope testing, CI vs PI distinctions, Partial F tests, and LINE diagnostics.',
    questions: [
      {
        id: 'cp5-1',
        type: 'scenario',
        question: 'An OLS simple linear regression model yields slope b1 = 2.45, SE(b1) = 0.70, and sample size n = 22. What is the test statistic t for H0: β1 = 0, and what would the ANOVA model F-statistic be for this exact regression?',
        options: [
          't = 3.50; F = √3.50 = 1.87',
          't = 3.50; F = (3.50)² = 12.25 on df (1, 20)',
          't = 1.715; F = 3.50',
          't = 3.50; F cannot be determined without the ANOVA table.',
        ],
        correctIndex: 1,
        explanation: 't = b1 / SE(b1) = 2.45 / 0.70 = 3.50 with df = n - 2 = 20. In simple linear regression with one predictor, MSR has 1 degree of freedom, and the relationship between the slope t-test and ANOVA F-test is EXACTLY F = t² = (3.50)² = 12.25 on (1, 20) degrees of freedom.',
        trapWarning: 'In SLR, F = t² always. But in Multiple Linear Regression (MLR), F is an omnibus test for all slopes simultaneously and does NOT equal individual t².',
      },
      {
        id: 'cp5-2',
        type: 'calculation',
        question: 'A full regression model has k = 5 predictors and SSE_full = 180 on n = 30 observations. A reduced model drops q = 2 predictors, giving SSE_red = 260. What is the Partial F-statistic testing whether the 2 dropped predictors are useful?',
        options: [
          'F = [(260 - 180)/2] / [180 / (30 - 5 - 1)] = [80 / 2] / [180 / 24] = 40 / 7.5 = 5.33',
          'F = (260 - 180) / 180 = 80 / 180 = 0.44',
          'F = [(260 - 180)/3] / [180 / 25] = 26.67 / 7.2 = 3.70',
          'F = (260 / 2) / (180 / 5) = 130 / 36 = 3.61',
        ],
        correctIndex: 0,
        explanation: 'Partial F = [(SSE_red - SSE_full) / q] / MSE_full. Here q = 2 dropped predictors, df_error(full) = n - k - 1 = 30 - 5 - 1 = 24. MSE_full = 180 / 24 = 7.5. Numerator = (260 - 180) / 2 = 40. Partial F = 40 / 7.5 = 5.33 on (2, 24) degrees of freedom.',
        trapWarning: 'Exam 3 formula sheet omits the Partial F formula! Always divide the change in SSE by q (number of dropped predictors), not k.',
      },
      {
        id: 'cp5-3',
        type: 'trap-check',
        question: 'At x0 = 15, an engineer calculates both a 95% Confidence Interval for mean response μ_{Y|x0} and a 95% Prediction Interval for an individual future response y0. Which interval is wider and why?',
        options: [
          'The CI is wider because estimating a mean requires more information than a single point.',
          'The Prediction Interval is strictly wider because it includes the variance of the regression line PLUS the random scatter σ² of the individual point: SE(pred) = s√[1 + 1/n + (x0-x̄)²/Sxx].',
          'Both intervals have identical widths because both use critical value t_0.025, n-2.',
          'The PI is narrower because n is large.',
        ],
        correctIndex: 1,
        explanation: 'Predicting a single future observation has two independent sources of error: (1) uncertainty about the true regression line position, and (2) natural variation of an individual observation around that line. That is why the PI standard error formula has an extra "+ 1" under the radical, making it strictly wider than the mean CI.',
        trapWarning: 'Look for the "+ 1" under the square root on your formula sheet: that is the giveaway for the Prediction Interval.',
      },
    ],
  },
  6: {
    module: 6,
    title: 'Module 6 Active Recall Capstone: Design of Experiments & ANOVA',
    subtitle: 'Verify CRD vs RCBD partition of variance, Tukey HSD, and blocking power.',
    questions: [
      {
        id: 'cp6-1',
        type: 'scenario',
        question: 'A factory tests k = 4 machine speeds using b = 5 operators in a Randomized Complete Block Design (RCBD). What are the error degrees of freedom in the ANOVA table?',
        options: [
          'df_error = (4 - 1)(5 - 1) = 3 × 4 = 12',
          'df_error = (4)(5) - 4 = 16',
          'df_error = 20 - 1 = 19',
          'df_error = 4 + 5 - 2 = 7',
        ],
        correctIndex: 0,
        explanation: 'In an RCBD with k treatments and b blocks: Treatment df = k - 1 = 3; Block df = b - 1 = 4; Error df = (k - 1)(b - 1) = 3 × 4 = 12; Total df = kb - 1 = 19.',
        trapWarning: 'In CRD, error df is N - k = 20 - 4 = 16. In RCBD, you trade away 4 df to the block factor, leaving 12 error df.',
      },
      {
        id: 'cp6-2',
        type: 'calculation',
        question: 'A One-Way ANOVA with k = 3 groups and n = 6 per group rejects H0 with MSE = 4.0. The Studentized range critical value is q_0.05(3, 15) = 3.67. What is Tukey\'s minimum significant difference W?',
        options: [
          'W = 3.67 * √(4.0 / 6) = 3.67 * 0.8165 = 3.00',
          'W = 3.67 * (4.0 / 6) = 2.45',
          'W = 3.67 * √(4.0 / 18) = 1.73',
          'W = 1.96 * √(4.0 / 6) = 1.60',
        ],
        correctIndex: 0,
        explanation: 'Tukey\'s HSD threshold for equal sample size n is W = q_α(k, ν) * √(MSE / n). Here q = 3.67, MSE = 4.0, and n = 6. W = 3.67 * √(4/6) = 3.67 * 0.8165 ≈ 3.00. Any two group means differing by 3.00 or more are significantly different.',
        trapWarning: 'In the denominator of √(MSE/n), use n (sample size per group), NOT total sample size N!',
      },
      {
        id: 'cp6-3',
        type: 'trap-check',
        question: 'When is blocking in an RCBD considered effective, and what is the consequence if the blocking factor is completely ineffective (MSBl ≈ MSE)?',
        options: [
          'Blocking is effective if MSBl ≤ MSE; if ineffective, test power increases.',
          'Blocking is effective when MSBl >> MSE (removes significant nuisance noise); if MSBl ≈ MSE, blocking wasted (b - 1) error degrees of freedom without shrinking MSE, reducing test power.',
          'Blocking is always superior to CRD regardless of MSBl.',
          'Blocking is only used when treatments cannot be randomized.',
        ],
        correctIndex: 1,
        explanation: 'Blocking pays a price: it consumes (b - 1) degrees of freedom from the error term. If the block variable was meaningful (MSBl >> MSE), it removes large noise from SSE, shrinking MSE and boosting the treatment F-statistic. But if MSBl ≈ MSE, MSE does not shrink, yet error df was reduced, which increases critical F and reduces statistical power.',
        trapWarning: 'Never block on an irrelevant variable—you lose degrees of freedom for zero reduction in error variance!',
      },
    ],
  },
};

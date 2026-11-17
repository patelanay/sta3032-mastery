export interface ConceptLesson {
  intuitiveExplanation: string; // "Why does this concept exist and what physical intuition should you hold?"
  coreRule: string; // The mathematical/statistical condition or decision trigger
  workedExample: {
    context: string;
    stepByStep: string[];
    result: string;
    resultLatex?: string;
  };
  examPitfall: string; // Exactly what Lindberg tests and where students lose points
  diagramOrVisual?: string; // ASCII diagram, boxplot/scatter/table visualization
  latexFormula?: string;
}

export interface ActiveRecallPrompt {
  id: string;
  topicIndex: number;
  topicTitle: string;
  module: 1 | 2 | 3 | 4 | 5 | 6;
  lesson: ConceptLesson;
  interrogationPrompt: string;
  feynmanPrompt: string;
  modelAnswer: string;
  modelAnswerLatex?: string;
  keyConcepts: string[];
  selfCheckQuestions: string[];
}

export const activeRecallPrompts: Record<number, ActiveRecallPrompt[]> = {
  1: [
    {
      id: 'ar-m1-0',
      topicIndex: 0,
      topicTitle: 'Sample mean and sample variance s²',
      module: 1,
      lesson: {
        intuitiveExplanation:
          'When you take a sample, you almost never know the true population mean μ. Instead, you compute the sample mean x̄. Because x̄ is calculated right from the center of those exact sample points, the data points sit closer to x̄ than they do to the true unknown μ. If you divided by n, you would consistently underestimate the true spread σ². Dividing by (n - 1)—known as Bessel\'s Correction—expands the denominator just enough to cancel out this negative bias, making s² an unbiased estimator (i.e. E[s²] = σ²). You "spent" 1 degree of freedom estimating x̄.',
        coreRule:
          'Formula: s² = Σ(x_i - x̄)² / (n - 1) = [Σx_i² - (Σx_i)²/n] / (n - 1). Degrees of freedom df = n - 1. E[s²] = σ² (unbiased). However, sample standard deviation s is NOT unbiased for σ (E[s] < σ due to square-root curvature).',
        latexFormula: 's^2 = \\frac{1}{n-1}\\sum_{i=1}^n (x_i - \\bar{x})^2 = \\frac{\\sum_{i=1}^n x_i^2 - \\frac{(\\sum x_i)^2}{n}}{n-1}',
        workedExample: {
          context: 'An aerospace lab tests n = 4 titanium tensile specimens: strengths are 400, 410, 420, 450 MPa.',
          stepByStep: [
            '1. Compute sample mean: x̄ = (400 + 410 + 420 + 450) / 4 = 1680 / 4 = 420 MPa.',
            '2. Compute deviations: (400 - 420) = -20, (410 - 420) = -10, (420 - 420) = 0, (450 - 420) = +30.',
            '3. Square deviations: (-20)² = 400, (-10)² = 100, 0² = 0, 30² = 900. Sum = 1400.',
            '4. Divide by df = n - 1 = 3: s² = 1400 / 3 = 466.67 MPa².',
            '5. Sample standard deviation: s = √466.67 = 21.60 MPa.',
          ],
          result: 'Sample variance s² = 466.67 MPa², sample standard deviation s = 21.60 MPa.',
          resultLatex: 's^2 = \\frac{1400}{4-1} = 466.67 \\text{ MPa}^2, \\quad s = \\sqrt{466.67} = 21.60 \\text{ MPa}',
        },
        examPitfall:
          'Never divide by n when computing sample variance on the exam. Also remember: deviations around the sample mean always sum to exactly zero: Σ(x_i - x̄) = 0. If your deviations don\'t sum to 0, your x̄ is wrong!',
        diagramOrVisual: `
  Population with unknown μ:  [-------•-------]
                              μ is true center
  Sample points:               x₁    x₂  x̄  x₃    x₄
                              Points cluster tighter to x̄ than to μ!
                              ==> Dividing by (n-1) fixes the bias.
`,
      },
      interrogationPrompt:
        'Why do we divide by (n - 1) instead of n when computing sample variance s²? What exact mathematical property does this achieve?',
      feynmanPrompt:
        'Explain Bessel\'s correction (dividing by n - 1) in plain English without using complex calculus.',
      modelAnswer:
        'Because sample observations are closer on average to the sample mean x̄ than to the true unknown population mean μ, dividing by n systematically underestimates σ². Dividing by degrees of freedom (n - 1) corrects this negative bias, making s² an unbiased estimator of σ² (i.e., E[s²] = σ²). One degree of freedom is consumed calculating x̄.',
      keyConcepts: [
        'Unbiased estimator (E[s²] = σ²)',
        'Degrees of freedom lost to estimating x̄',
        'Underestimation when dividing by n',
      ],
      selfCheckQuestions: [
        'What would happen to the expected value of s² if we divided by n instead?',
        'How many degrees of freedom does a sample variance of size n have?',
      ],
    },
    {
      id: 'ar-m1-1',
      topicIndex: 1,
      topicTitle: 'p-th percentile interpolation (sample percentiles)',
      module: 1,
      lesson: {
        intuitiveExplanation:
          'The p-th percentile is the cut-off value below which p percent of the data falls. For small samples, the exact percentage rarely lands squarely on an observed data point. We sort the data ascending, compute a position index L, and use Lindberg\'s course rule: if the position index is not an integer, round UP to the next integer position. If it IS an integer, average the value at that position with the next one.',
        coreRule:
          '1. Order observations: x(1) ≤ x(2) ≤ ... ≤ x(n).\n2. Calculate position index: L = n * (p / 100).\n3. If L is NOT an integer: round UP to ⌈L⌉; percentile = x(⌈L⌉).\n4. If L IS an integer: average positions L and L + 1: percentile = [x(L) + x(L+1)] / 2.',
        latexFormula: 'L = n \\cdot \\left(\\frac{p}{100}\\right), \\quad \\text{if non-integer: } x_{(\\lceil L \\rceil)}, \\quad \\text{if integer: } \\frac{x_{(L)} + x_{(L+1)}}{2}',
        workedExample: {
          context: 'Find the 75th percentile (Q3) of n = 10 measurements: 12, 15, 19, 24, 28, 31, 35, 42, 48, 55 (already sorted).',
          stepByStep: [
            '1. n = 10, p = 75.',
            '2. L = 10 * (75 / 100) = 7.5.',
            '3. 7.5 is NOT an integer, so round UP to position 8: ⌈7.5⌉ = 8.',
            '4. Look up 8th value in ordered list: x(8) = 42.',
          ],
          result: 'The 75th percentile (Q3) is 42.',
        },
        examPitfall:
          'Do NOT use Excel\'s PERCENTILE.EXC or continuous linear interpolation unless explicitly asked. Lindberg teaches the integer/non-integer position index rounding rule above.',
        diagramOrVisual: `
  Data: [12, 15, 19, 24, 28, 31, 35, 42, 48, 55]
  Index:  1   2   3   4   5   6   7   8   9   10
  L = 10 * 0.75 = 7.5  -->  Round up to 8th element = 42
`,
      },
      interrogationPrompt:
        'How do you determine whether to average two adjacent values or round when finding a sample percentile in ordered data?',
      feynmanPrompt:
        'Explain how to find the 75th percentile of 12 numbers to a middle school student.',
      modelAnswer:
        'Order observations x(1) ≤ x(2) ≤ ... ≤ x(n). Compute rank index L = n * p / 100. If L is not an integer, round UP to ⌈L⌉ and take x(⌈L⌉). If L is an integer, average x(L) and x(L+1). This ensures consistency without bias.',
      keyConcepts: [
        'Sort data ascending first',
        'Position index calculation L = n * p / 100',
        'Integer vs non-integer rank rules',
      ],
      selfCheckQuestions: [
        'If n = 20, what index position corresponds to the median (50th percentile)?',
        'Can a percentile be a value not in the original dataset?',
      ],
    },
    {
      id: 'ar-m1-2',
      topicIndex: 2,
      topicTitle: 'Interquartile Range (IQR = Q3 - Q1)',
      module: 1,
      lesson: {
        intuitiveExplanation:
          'Range (Max - Min) and standard deviation s are completely hijacked by a single outlier. If Bill Gates walks into a coffee shop, the average net worth becomes $500M and the standard deviation explodes, even though nobody else got richer. The Interquartile Range (IQR) ignores the top 25% and bottom 25% entirely and measures only the width of the middle 50%. It is a "resistant" or "robust" statistic with a 25% breakdown point.',
        coreRule:
          'IQR = Q3 - Q1. Q1 = 25th percentile, Q3 = 75th percentile. If a dataset has extreme skewness or severe outliers, report Median and IQR instead of Mean and Standard Deviation.',
        latexFormula: '\\text{IQR} = Q_3 - Q_1 = x_{0.75} - x_{0.25}',
        workedExample: {
          context: 'Given ordered test scores: 52, 60, 68, 72, 75, 78, 82, 85, 90, 98 (n = 10).',
          stepByStep: [
            '1. Find Q1 (25th percentile): L = 10 * 0.25 = 2.5 → round UP to 3rd element: Q1 = 68.',
            '2. Find Q3 (75th percentile): L = 10 * 0.75 = 7.5 → round UP to 8th element: Q3 = 85.',
            '3. IQR = Q3 - Q1 = 85 - 68 = 17 points.',
          ],
          result: 'IQR = 17 points.',
        },
        examPitfall:
          'When Lindberg asks: "Which measure of spread should be reported for this right-skewed distribution?", writing "standard deviation" will lose full credit. You must answer IQR (paired with Median)!',
        diagramOrVisual: `
      Bottom 25%        Middle 50% (IQR)         Top 25%
   |--------------|==========================|--------------|
  Min             Q1          Median         Q3            Max
                  <---------  IQR  --------->
`,
      },
      interrogationPrompt:
        'Why is IQR preferred over standard deviation s or range when describing skewed distributions or data with extreme observations?',
      feynmanPrompt:
        'Why do meteorologists and economists prefer median and IQR over mean and standard deviation for income and rainfall data?',
      modelAnswer:
        'IQR measures the spread of the central 50% of ordered data. It is a robust statistic with a high breakdown point (up to 25% of extreme values can be contaminated without changing IQR), whereas range and standard deviation are heavily distorted by even a single extreme outlier.',
      keyConcepts: [
        'Robustness against outliers',
        'Middle 50% spread',
        'High breakdown point vs zero for standard deviation',
      ],
      selfCheckQuestions: [
        'Does changing the highest value in a dataset from 100 to 1,000,000 affect IQR? Does it affect s?',
        'What percentage of data lies between Q1 and Q3?',
      ],
    },
    {
      id: 'ar-m1-3',
      topicIndex: 3,
      topicTitle: '1.5 × IQR outlier detection rule',
      module: 1,
      lesson: {
        intuitiveExplanation:
          'How far out does a point have to be before we declare it suspicious? John Tukey established the standard "inner fences": take the width of the middle 50% (IQR), multiply by 1.5, and extend that distance below Q1 and above Q3. Anything beyond these fences is flagged as an outlier. In a perfectly bell-shaped normal curve, this rule flags about 0.7% of points (roughly 1 in 143) purely by random chance.',
        coreRule:
          'Lower Fence = Q1 - 1.5 × IQR\nUpper Fence = Q3 + 1.5 × IQR\nAny observation x < Lower Fence OR x > Upper Fence is an OUTLIER.\n(Extreme outliers: beyond 3.0 × IQR).',
        latexFormula: '\\text{Lower Fence} = Q_1 - 1.5(\\text{IQR}), \\quad \\text{Upper Fence} = Q_3 + 1.5(\\text{IQR})',
        workedExample: {
          context: 'A concrete beam cracking study has Q1 = 30 kN and Q3 = 50 kN. Beam A cracked at 18 kN, Beam B cracked at 85 kN.',
          stepByStep: [
            '1. IQR = Q3 - Q1 = 50 - 30 = 20 kN.',
            '2. 1.5 × IQR = 1.5 × 20 = 30 kN.',
            '3. Lower Fence = Q1 - 30 = 30 - 30 = 0 kN.',
            '4. Upper Fence = Q3 + 30 = 50 + 30 = 80 kN.',
            '5. Check Beam A (18 kN): 18 is between 0 and 80 → NOT an outlier.',
            '6. Check Beam B (85 kN): 85 > 80 → OUTLIER!',
          ],
          result: 'Beam B (85 kN) is an outlier; Beam A is within normal fences.',
        },
        examPitfall:
          'Do NOT add 1.5×IQR to the Mean or Median! Fences are anchored to Q1 (lower) and Q3 (upper). Subtract from Q1, add to Q3.',
        diagramOrVisual: `
  [Lower Fence]               BOXPLOT                [Upper Fence]
       |         |---------|===========|---------|         |       * (Outlier)
   Q1 - 1.5(IQR)  Min      Q1   Med   Q3       Max   Q3 + 1.5(IQR)
`,
      },
      interrogationPrompt:
        'How are the inner fences [Q1 - 1.5*IQR, Q3 + 1.5*IQR] derived, and what happens to a normal distribution under this rule?',
      feynmanPrompt:
        'Explain how a boxplot decides which dots get flagged as outliers with asterisks.',
      modelAnswer:
        'Fences are lower fence = Q1 - 1.5(IQR) and upper fence = Q3 + 1.5(IQR). Any point strictly outside these fences is an outlier. For a theoretical normal distribution, fences correspond to roughly μ ± 2.7σ, flagging ~0.7% of points purely by random variation.',
      keyConcepts: [
        'Lower fence: Q1 - 1.5*IQR',
        'Upper fence: Q3 + 1.5*IQR',
        'Flags ~0.7% of points in normal distributions by chance',
      ],
      selfCheckQuestions: [
        'If Q1 = 20 and Q3 = 35, calculate the lower and upper fences. Is 60 an outlier?',
        'What is an extreme outlier (3 × IQR fence)?',
      ],
    },
    {
      id: 'ar-m1-4',
      topicIndex: 4,
      topicTitle: 'Boxplots, histograms, and skewness interpretation',
      module: 1,
      lesson: {
        intuitiveExplanation:
          'Think of the mean as the balance point of a seesaw, while the median is the midpoint person in line. If you pull out a few gigantic values way to the right (like hospital stay lengths or repair costs), the seesaw has to shift its balance point far to the right to balance those extreme values. That pulls the Mean to the right. The Median barely moves because it only counts rank position. Hence, in right-skewed data, Mode < Median < Mean.',
        coreRule:
          '• Right-skewed (positive skew): Mode < Median < Mean. Long tail points to the RIGHT. Right whisker of boxplot is longer.\n• Left-skewed (negative skew): Mean < Median < Mode. Long tail points to the LEFT. Left whisker of boxplot is longer.\n• Symmetric: Mean ≈ Median ≈ Mode.',
        latexFormula: '\\text{Right Skew: } \\text{Mode} < \\text{Median} < \\bar{x}, \\qquad \\text{Left Skew: } \\bar{x} < \\text{Median} < \\text{Mode}',
        workedExample: {
          context: 'An assembly line inspection reports: Mode = 12 sec, Median = 19 sec, Mean = 28 sec.',
          stepByStep: [
            '1. Compare values: 12 < 19 < 28.',
            '2. Since Mode < Median < Mean, the distribution is RIGHT-SKEWED.',
            '3. Physical interpretation: Most assembly steps take 12-19 seconds, but a few problematic steps take 60-120 seconds, pulling the mean up to 28 sec.',
          ],
          result: 'Right-skewed distribution. Report Median = 19s and IQR for description.',
        },
        examPitfall:
          'Skewness direction is named after where the LONG TAIL points, NOT where the main hump is! If the hump is on the left and the tail drags out to the right, it is RIGHT-skewed.',
        diagramOrVisual: `
     RIGHT-SKEWED (Positive Skew)
       |   __
       |  /  \\
       | /    \\_______
       |/             \\_________
       +---------------------------->
        Mode  Med   Mean     (Tail to Right)
`,
      },
      interrogationPrompt:
        'When looking at a right-skewed histogram, what is the relative order of the Mode, Median, and Mean, and why does this relationship hold?',
      feynmanPrompt:
        'Explain why house prices and executive salaries create a long tail to the right and pull the average away from what most people make.',
      modelAnswer:
        'For right-skewed data: Mode < Median < Mean. The extreme positive tail values exert large leverage on the sum Σx_i, pulling the arithmetic mean to the right. The median only tracks rank position, so it remains resistant.',
      keyConcepts: [
        'Mode < Median < Mean for right skew',
        'Long tail pulls the mean toward extreme values',
        'Median marks the 50/50 balance point',
      ],
      selfCheckQuestions: [
        'If Mean = 85 and Median = 65, what direction is the distribution skewed?',
        'Where is the longer whisker on a boxplot for left-skewed data?',
      ],
    },
  ],
  5: [
    {
      id: 'ar-m5-0',
      topicIndex: 0,
      topicTitle: 'Simple Linear Regression (SLR) OLS estimates b₀ and b₁',
      module: 5,
      lesson: {
        intuitiveExplanation:
          'In simple linear regression, you have a cloud of data points (x_i, y_i) and want to draw a straight line ŷ = b₀ + b₁x through them. But what makes a line "best"? Ordinary Least Squares (OLS) measures the VERTICAL error (residual e_i = y_i - ŷ_i) from each point to the line, squares each error (so positive and negative errors don\'t cancel out, and big misses are penalized heavily), and minimizes their total sum: SSE = Σ(y_i - ŷ_i)². By setting the calculus derivatives to zero, we get two magical guarantees: (1) the slope is b₁ = S_xy / S_xx = r × (s_y / s_x), and (2) the line ALWAYS passes right through the center of mass (x̄, ȳ), meaning b₀ = ȳ - b₁x̄.',
        coreRule:
          '1. Slope: b₁ = S_xy / S_xx = Σ(x_i - x̄)(y_i - ȳ) / Σ(x_i - x̄)² = r × (s_y / s_x).\n2. Intercept: b₀ = ȳ - b₁x̄ (derived from the fact that the line MUST pass through (x̄, ȳ)).\n3. Scope: Model is valid ONLY within the range min(x) ≤ x ≤ max(x). Never extrapolate outside this support!\n4. Sum of residuals: Σe_i = Σ(y_i - ŷ_i) = 0 exactly.',
        latexFormula: 'b_1 = \\frac{S_{xy}}{S_{xx}} = r\\frac{s_y}{s_x}, \\qquad b_0 = \\bar{y} - b_1\\bar{x}, \\qquad \\hat{y} = b_0 + b_1 x',
        workedExample: {
          context: 'From Lindberg\'s Lecture 24 copier servicing example: x = number of copiers serviced, y = minutes spent by technician (n = 45). Summary stats: x̄ = 5.11, ȳ = 76.27, s_x = 2.97, s_y = 44.75, r = 0.997.',
          stepByStep: [
            '1. Compute slope b₁ = r × (s_y / s_x) = 0.997 × (44.75 / 2.97) = 15.035 min/copier.',
            '2. Compute intercept b₀ = ȳ - b₁x̄ = 76.27 - (15.035 × 5.11) = 76.27 - 76.83 = -0.58 min.',
            '3. Estimated fitted equation: ŷ = -0.58 + 15.035x for 1 ≤ x ≤ 10 copiers.',
            '4. Interpretation of slope: Each additional copier serviced increases mean service time by 15.035 minutes.',
            '5. Interpretation of intercept: When x = 0 copiers, predicted time is -0.58 min (has no physical meaning because 0 is outside data support).',
          ],
          result: 'Fitted model: ŷ = -0.580 + 15.035x. For x = 5 copiers: ŷ = -0.58 + 15.035(5) = 74.60 minutes.',
          resultLatex: '\\hat{y} = -0.580 + 15.035x, \\quad \\hat{y}(5) = 74.60 \\text{ min}',
        },
        examPitfall:
          'Extrapolation Trap: If the exam asks you to predict service time for 25 copiers when data only ranges from 1 to 10 copiers, do NOT just plug in 25! State: "Extrapolation hazard: x = 25 is outside the support of the data; relationship may become non-linear or capacity-constrained."',
        diagramOrVisual: `
     y (Time)
      |              * (y_i)
      |             /|
      |            / |  <-- Vertical Residual e_i = y_i - ŷ_i
      |           /  * (ŷ_i on the line)
      |          /
      |         / • Center of Mass (x̄, ȳ) always on line!
      |        /
      +-------+-------------------> x (Copiers)
             b₀ (Intercept at x = 0)
`,
      },
      interrogationPrompt:
        'How does Ordinary Least Squares (OLS) define the "best" fitting line, and why does the fitted line always pass through (x̄, ȳ)?',
      feynmanPrompt:
        'Explain why minimizing the sum of squared vertical distances guarantees the line balances at the center of the data.',
      modelAnswer:
        'OLS minimizes the sum of squared vertical residuals: SSE = Σ (y_i - (b0 + b1*x_i))². Setting partial derivatives ∂SSE/∂b0 = 0 and ∂SSE/∂b1 = 0 yields the normal equations. The first equation Σ(y_i - b0 - b1*x_i) = 0 implies ȳ - b0 - b1*x̄ = 0, meaning b0 = ȳ - b1*x̄. Substituting this proves that when x = x̄, ŷ = ȳ, so (x̄, ȳ) always lies on the regression line.',
      keyConcepts: [
        'Minimizes SSE = Σ e_i²',
        'b1 = Sxy / Sxx = r * (sy / sx)',
        'Line always passes through center of mass (x̄, ȳ)',
      ],
      selfCheckQuestions: [
        'If correlation r = 0.8, sx = 2, sy = 5, what is slope b1?',
        'What is the sum of raw residuals Σ e_i in an OLS regression with an intercept?',
      ],
    },
    {
      id: 'ar-m5-1',
      topicIndex: 1,
      topicTitle: 'Hypothesis testing and CI for slope β₁',
      module: 5,
      lesson: {
        intuitiveExplanation:
          'Just because your sample slope b₁ is 15.0 does not mean there is a true relationship in the whole population. By pure bad luck or random noise, you could get a non-zero slope even if true β₁ = 0 (flat line, x is useless for predicting y). We test H₀: β₁ = 0 vs Hₐ: β₁ ≠ 0 using a t-test with df = n - 2. In simple linear regression (1 predictor), testing if the slope is non-zero is 100% equivalent to testing if the correlation r ≠ 0, AND it equals the ANOVA F-test: F = t²!',
        coreRule:
          '1. Test statistic: t = (b₁ - 0) / SE(b₁) with df = n - 2.\n2. Standard error: SE(b₁) = s / √S_xx, where s = √MSE = √[SSE / (n - 2)].\n3. Confidence Interval for β₁: b₁ ± t_{α/2, n-2} × SE(b₁).\n4. SLR Equivalence: F_{(1, n-2)} = (t_{n-2})² exactly.',
        latexFormula: 't = \\frac{b_1}{s / \\sqrt{S_{xx}}} \\sim t_{n-2}, \\qquad \\text{CI: } b_1 \\pm t_{\\alpha/2, n-2} \\frac{s}{\\sqrt{S_{xx}}}, \\qquad F = t^2',
        workedExample: {
          context: 'In an oil pipeline flow model (n = 20), b₁ = 4.20, s = 2.50, and S_xx = 100. Test H₀: β₁ = 0 vs Hₐ: β₁ ≠ 0 at α = 0.05.',
          stepByStep: [
            '1. Degrees of freedom: df = n - 2 = 20 - 2 = 18.',
            '2. Compute SE(b₁): SE(b₁) = s / √S_xx = 2.50 / √100 = 2.50 / 10 = 0.25.',
            '3. Compute t-statistic: t = 4.20 / 0.25 = 16.80.',
            '4. Critical value from t-table: t_{0.025, 18} = 2.101.',
            '5. Decision: |16.80| > 2.101 → Reject H₀ (p < 0.0001). Conclude there is a statistically significant linear relationship.',
            '6. Verify ANOVA F: F = t² = (16.80)² = 282.24 on (1, 18) df.',
          ],
          result: 't = 16.80, Reject H₀. 95% CI for β₁ is 4.20 ± 2.101(0.25) = [3.675, 4.725].',
          resultLatex: 't = \\frac{4.20}{0.25} = 16.80 > 2.101, \\quad \\text{95\\% CI: } [3.675, 4.725]',
        },
        examPitfall:
          'Degrees of freedom is n - 2, NOT n - 1! You lost 2 degrees of freedom because you estimated TWO parameters (β₀ and β₁).',
        diagramOrVisual: `
    H₀: β₁ = 0 (Flat line, x tells you nothing about y)
    --------------------------------------------------
    y |          *     *
      |     *      *       *    <-- Knowing x gives NO advantage over ȳ!
      +-------------------------> x

    Hₐ: β₁ ≠ 0 (Significant slope, x predicts y)
    ---------------------------------------------
    y |              *
      |         *  /
      |       *  /              <-- As x increases, y systematically changes!
      +-------------------------> x
`,
      },
      interrogationPrompt:
        'Why does testing H0: β1 = 0 in SLR test the exact same hypothesis as testing population correlation ρ = 0 and the overall ANOVA F-test?',
      feynmanPrompt:
        'Explain why testing if the slope is zero is identical to asking if the line explains anything at all.',
      modelAnswer:
        'Because b1 = r*(sy/sx), b1 = 0 if and only if r = 0. Furthermore, in SLR with 1 predictor, the regression sum of squares SSR has 1 df, so MSR = SSR. The F-statistic is F = MSR / MSE = (t_b1)². Both tests share the exact same null hypothesis (no linear relationship between X and Y) and give identical two-sided p-values: t²(n - 2) = F(1, n - 2).',
      keyConcepts: [
        't = b1 / SE(b1) with df = n - 2',
        'In SLR: t² = F exactly',
        'Equivalent to testing population correlation ρ = 0',
      ],
      selfCheckQuestions: [
        'What is SE(b1) in terms of s = √MSE and Sxx?',
        'If t_calc = -3.0 on 20 df, what would the corresponding ANOVA F-statistic be?',
      ],
    },
    {
      id: 'ar-m5-2',
      topicIndex: 2,
      topicTitle: 'Confidence Interval for Mean Response μ_{Y|x₀} vs Prediction Interval for y₀',
      module: 5,
      lesson: {
        intuitiveExplanation:
          'Imagine you run a factory. Question 1: "What is the average power bill for ALL days when temperature is 90°F?" Question 2: "What will TOMORROW\'S power bill be if it hits 90°F?" Question 1 is asking about the mean of the line (μ_{Y|x₀}). The only uncertainty is where the true line sits. But Question 2 is about ONE single day (y₀). Not only do you not know where the true line is, but any single day has random individual fluctuations (noise σ²). That is why a Prediction Interval is ALWAYS wider than a Confidence Interval: it has an extra "+ 1" under the square root to account for individual scatter!',
        coreRule:
          '• CI for Mean Response μ_{Y|x₀}: ŷ₀ ± t_{α/2, n-2} × s × √[ 1/n + (x₀ - x̄)² / S_xx ]\n• PI for Individual Observation y₀: ŷ₀ ± t_{α/2, n-2} × s × √[ 1 + 1/n + (x₀ - x̄)² / S_xx ]\nNotice the extra "+ 1" inside the square root of the PI formula. As n → ∞, CI width → 0, but PI width → 2z_{α/2}σ.',
        latexFormula: '\\text{CI: } \\hat{y}_0 \\pm t s \\sqrt{\\frac{1}{n} + \\frac{(x_0 - \\bar{x})^2}{S_{xx}}}, \\qquad \\text{PI: } \\hat{y}_0 \\pm t s \\sqrt{1 + \\frac{1}{n} + \\frac{(x_0 - \\bar{x})^2}{S_{xx}}}',
        workedExample: {
          context: 'Fitted line ŷ = 10 + 2x. Summary: n = 25, x̄ = 15, S_xx = 200, s = 4.0. We want 95% intervals at x₀ = 15 (right at the mean). Here t_{0.025, 23} = 2.069.',
          stepByStep: [
            '1. Point prediction: ŷ₀ = 10 + 2(15) = 40.',
            '2. Since x₀ = x̄ = 15, the term (x₀ - x̄)² / S_xx = 0 (intervals are at their narrowest point!).',
            '3. CI for Mean: SE = s√[1/n] = 4.0 × √(1/25) = 4.0 × 0.2 = 0.80.\n   Margin of error = 2.069 × 0.80 = 1.66.\n   CI = [40 - 1.66, 40 + 1.66] = [38.34, 41.66].',
            '4. PI for Individual: SE = s√[1 + 1/n] = 4.0 × √(1 + 0.04) = 4.0 × 1.0198 = 4.08.\n   Margin of error = 2.069 × 4.08 = 8.44.\n   PI = [40 - 8.44, 40 + 8.44] = [31.56, 48.44].',
          ],
          result: 'CI = [38.34, 41.66] (width = 3.32) vs PI = [31.56, 48.44] (width = 16.88, over 5× wider!).',
          resultLatex: '\\text{CI: } [38.34, 41.66] \\quad \\text{vs} \\quad \\text{PI: } [31.56, 48.44]',
        },
        examPitfall:
          'Exam question wording: Look for the word "average" or "mean" (→ CI for μ) versus "individual", "a single unit", "tomorrow\'s", or "a new observation" (→ PI for y₀). Choosing the wrong one is an automatic 5-point deduction.',
        diagramOrVisual: `
     y |                   /   /  <-- Outer funnel: Prediction Interval (Wide)
       |                  / . /
       |                 / / /    <-- Inner funnel: Confidence Interval (Narrow)
       |                / / /
       |        -------•-------   <-- Narrowest right at x₀ = x̄ !
       |              / / /
       |             / / /
       +------------+-----------------> x
                   x̄
`,
      },
      interrogationPrompt:
        'Why is a Prediction Interval for an individual observation y0 ALWAYS wider than a Confidence Interval for the mean response μ_{Y|x0} at the same x0?',
      feynmanPrompt:
        'Explain why predicting the average GPA of all mechanical engineers is much easier than predicting ONE specific student\'s GPA.',
      modelAnswer:
        'Estimating the mean response μ_{Y|x0} only has uncertainty in where the true line lies: SE(μ̂) = s * √[1/n + (x0 - x̄)²/Sxx]. An individual new observation y0 has TWO independent sources of uncertainty: (1) uncertainty in where the true regression line lies, PLUS (2) the random scatter of an individual point around that line (variance σ²). Thus SE(pred) = s * √[1 + 1/n + (x0 - x̄)²/Sxx]. The extra "1" inside the square root makes the PI strictly wider.',
      keyConcepts: [
        'CI has 1/n; PI has 1 + 1/n inside the radical',
        'PI includes individual variance σ² of single observation',
        'Both intervals are narrowest at x0 = x̄ and flare outward',
      ],
      selfCheckQuestions: [
        'What happens to both intervals as you move x0 far away from sample mean x̄?',
        'As sample size n → ∞, what happens to CI width vs PI width?',
      ],
    },
    {
      id: 'ar-m5-3',
      topicIndex: 3,
      topicTitle: 'LINE regression assumptions, residual plots & power transformations (Tukey ladder)',
      module: 5,
      lesson: {
        intuitiveExplanation:
          'Before you can trust any regression p-value or confidence interval, you must verify that the linear model wasn\'t a lie. The four core assumptions form the famous acronym LINE: Linearity, Independence, Normality, and Equal Variance. Because you cannot see the true errors ε_i, you check these assumptions using the residuals: e_i = y_i - ŷ_i. If an assumption fails, you use Tukey\'s Ladder of Powers to transform the variable and straighten the curve or stabilize the variance.',
        coreRule:
          '• L - Linearity: Plot residuals e_i vs ŷ_i. Ideal: random horizontal band centered at 0. Violation: curved U-shape or upside-down U (indicates non-linear relationship; add x² or transform x).\n• I - Independence: Plot residuals against time order. Ideal: random scatter. Violation: snake-like waves or alternating trends (autocorrelation).\n• N - Normality of errors: Normal QQ-plot of residuals. Ideal: points lie strictly along a 45° diagonal line. Violation: S-curve (heavy/light tails) or banana curve (skewness; transform y using Box-Cox / ln y).\n• E - Equal Variance (Homoscedasticity): Plot residuals e_i vs ŷ_i. Ideal: constant vertical spread across all ŷ. Violation: megaphone / funnel shape (variance grows with ŷ; transform y with √y or ln y).',
        latexFormula: 'e_i = y_i - \\hat{y}_i, \\qquad \\text{Tukey Ladder: } \\dots, x^{-1}, \\ln(x), x^{1/2}, x^1, x^2, x^3, \\dots',
        workedExample: {
          context: 'An engineer fits a regression of bearing wear (y) on machine speed (x). The residual vs fitted plot shows residuals fanning out from ±2 mm at ŷ = 10 up to ±18 mm at ŷ = 90 (megaphone shape).',
          stepByStep: [
            '1. Identify the pattern: Megaphone / funnel shape expanding to the right.',
            '2. Diagnose violated assumption: Equal Variance (Homoscedasticity) is violated. Error variance increases as fitted value increases.',
            '3. Prescribe remedy: Apply a variance-stabilizing transformation on response variable y down Tukey\'s ladder: replace y with y\' = ln(y) or y\' = √y.',
          ],
          result: 'Violation: Heteroscedasticity (Equal Variance). Fix: Log-transform the response y\' = ln(y).',
        },
        examPitfall:
          'Never evaluate Linearity or Equal Variance using a plot of y vs x! You must always evaluate the RESIDUAL plot e_i vs ŷ_i.',
        diagramOrVisual: `
  RESIDUALS VS FITTED (e vs ŷ):
  Good (No violation):          Bad: Non-Linear (U-shape):      Bad: Funnel (Heteroscedastic):
   e |   *   *    *              e | *         *                 e |         *   *
     | *   *   *   *               |   *     *                     |     *   *     *
   0 +---------------+           0 +---------------+             0 +---------------+
     |   *   *   *                 |     * * *                         |     *   *     *
     | *       *                   |                               |         *   *
     +---------------> ŷ           +---------------> ŷ             +---------------> ŷ
`,
      },
      interrogationPrompt:
        'What does each letter of LINE stand for, what diagnostic plot detects violations of each, and how does Tukey\'s ladder fix them?',
      feynmanPrompt:
        'Explain how you check if a regression model is honest using residual plots.',
      modelAnswer:
        'L = Linearity (Residuals vs Fitted ŷ: curved pattern indicates nonlinearity; fix with polynomial or X transformation). I = Independence (Residuals vs Time order: runs/cycles indicate autocorrelation; Durbin-Watson test). N = Normality of errors (Normal QQ-plot of residuals: S-curves indicate heavy tails/skew; fix with Box-Cox / Tukey power ladder on Y). E = Equal variance / Homoscedasticity (Residuals vs ŷ: megaphone/funnel shape indicates heteroscedasticity; fix by transforming Y with ln(Y) or √Y).',
      keyConcepts: [
        'Linearity: no curved trend in e vs ŷ',
        'Independence: no serial pattern over time',
        'Normality: straight line on QQ-plot of residuals',
        'Equal variance: constant band/spread across all ŷ',
      ],
      selfCheckQuestions: [
        'If residual variance expands like a funnel as ŷ increases, which assumption is violated?',
        'If a scatterplot curves concave down, where on Tukey\'s ladder do you transform X (powers < 1 like √x, ln x)?',
      ],
    },
    {
      id: 'ar-m5-4',
      topicIndex: 4,
      topicTitle: 'Multiple Linear Regression (MLR): matrix form and ANOVA decomposition (SST = SSR + SSE)',
      module: 5,
      lesson: {
        intuitiveExplanation:
          'In multiple regression, you use k predictors (x₁, x₂, ..., x_k) to predict response y. Total variation in the data is SST = Σ(y_i - ȳ)². The regression line accounts for some of that variation (SSR), while the leftover unexplained noise is SSE. Just like energy, sum of squares is perfectly conserved: SST = SSR + SSE. The ANOVA table divides each sum of squares by its degrees of freedom to get Mean Squares: MSR = SSR / k and MSE = SSE / (n - k - 1). The overall F-test F = MSR / MSE tests if ANY of the k predictors are useful.',
        coreRule:
          '• Partition: SST = SSR + SSE\n• Degrees of freedom:\n  - df(SST) = n - 1\n  - df(SSR) = k (# of predictors)\n  - df(SSE) = n - (k + 1) = n - k - 1 (# of observations minus # of estimated parameters)\n• Overall F-test: F = MSR / MSE = [SSR / k] / [SSE / (n - k - 1)] on (k, n - k - 1) df.\n• Hypotheses: H₀: β₁ = β₂ = ... = β_k = 0 vs Hₐ: At least one β_j ≠ 0.',
        latexFormula: 'SST = SSR + SSE, \\quad F = \\frac{MSR}{MSE} = \\frac{SSR / k}{SSE / (n - k - 1)} \\sim F_{k, n-k-1}',
        workedExample: {
          context: 'An MLR model predicts chemical yield using k = 3 predictors (temperature, pressure, catalyst concentration) with n = 24 runs. An incomplete ANOVA table shows: SSR = 450, SST = 600.',
          stepByStep: [
            '1. Find SSE: SSE = SST - SSR = 600 - 450 = 150.',
            '2. Compute degrees of freedom:\n   - df(SSR) = k = 3\n   - df(SSE) = n - k - 1 = 24 - 3 - 1 = 20\n   - df(SST) = n - 1 = 23.',
            '3. Compute Mean Squares:\n   - MSR = SSR / df = 450 / 3 = 150\n   - MSE = SSE / df = 150 / 20 = 7.5.',
            '4. Compute overall F-statistic: F = MSR / MSE = 150 / 7.5 = 20.00 on (3, 20) df.',
            '5. Compute R²: R² = SSR / SST = 450 / 600 = 0.75 (75% of yield variation explained).',
          ],
          result: 'Overall F = 20.00 on (3, 20) df (p < 0.0001). Model is highly statistically significant; R² = 0.75.',
          resultLatex: 'F = \\frac{150}{7.5} = 20.00, \\quad R^2 = 0.75',
        },
        examPitfall:
          'Error degrees of freedom in MLR is n - k - 1, NOT n - k! The "- 1" comes from the intercept β₀.',
        diagramOrVisual: `
  ANOVA TABLE DECOMPOSITION:
  Source       SS      df             MS              F
  -------------------------------------------------------------
  Regression   SSR     k              MSR = SSR/k     F = MSR/MSE
  Error        SSE     n - k - 1      MSE = SSE/(n-k-1)
  -------------------------------------------------------------
  Total        SST     n - 1
`,
      },
      interrogationPrompt:
        'How are degrees of freedom distributed in an MLR model with k predictors and sample size n across SST, SSR, and SSE?',
      feynmanPrompt:
        'Explain how total variation in the outcome is split between what the model explained and what remains noise.',
      modelAnswer:
        'SST = SSR + SSE. Total df is n - 1. Regression (model) df is k (one for each predictor slope). Error (residual) df is n - (k + 1) = n - k - 1 (since k + 1 parameters β0, β1, ..., βk are estimated). MSR = SSR / k, and MSE = SSE / (n - k - 1). The overall F-test F = MSR / MSE tests H0: β1 = β2 = ... = βk = 0.',
      keyConcepts: [
        'df(SST) = n - 1',
        'df(SSR) = k',
        'df(SSE) = n - k - 1',
        'F = MSR / MSE on (k, n - k - 1) df',
      ],
      selfCheckQuestions: [
        'If n = 25 and there are 4 predictors, what are the degrees of freedom for MSE?',
        'What does a rejection of the overall F-test prove?',
      ],
    },
    {
      id: 'ar-m5-5',
      topicIndex: 5,
      topicTitle: 'Individual t-tests for predictors vs Partial F-test for subset of predictors',
      module: 5,
      lesson: {
        intuitiveExplanation:
          'Here is the classic MLR trap: the overall F-test has p < 0.0001 (the model clearly works!), but when you look at individual t-tests for x₁ and x₂, NEITHER is significant (both p > 0.10). How is that possible? Multicollinearity! If x₁ and x₂ are highly correlated with each other, each individual t-test asks: "What UNIQUE information does x₁ add given that x₂ is already in the room?" Since they overlap, neither adds unique value individually. You cannot drop both! To test whether you can drop a group of q predictors together, you must run a Partial F-test comparing the Full model to the Reduced model.',
        coreRule:
          '• Full Model has k predictors: SSE_full, df_error(full) = n - k - 1, MSE_full.\n• Reduced Model drops q predictors: SSE_red (always ≥ SSE_full).\n• Partial F formula: F = [ (SSE_red - SSE_full) / q ] / MSE_full\n• Degrees of freedom: df₁ = q (number of dropped predictors), df₂ = n - k - 1.\n• Hypotheses: H₀: β_{dropped} = 0 (reduced model is sufficient) vs Hₐ: At least one dropped β ≠ 0 (keep full model).',
        latexFormula: 'F = \\frac{(SSE_{\\text{red}} - SSE_{\\text{full}}) / q}{MSE_{\\text{full}}} \\sim F_{q, \\, n - k - 1}',
        workedExample: {
          context: 'Predicting vehicle fuel economy with n = 32 cars. Full model uses k = 5 predictors (weight, horsepower, displacement, cylinders, gears): SSE_full = 144.0, MSE_full = 144.0 / (32 - 5 - 1) = 144.0 / 26 = 5.538. We test whether we can drop q = 2 predictors (displacement and gears). Reduced model has SSE_red = 188.0.',
          stepByStep: [
            '1. Extra sum of squares due to dropped predictors: SSE_red - SSE_full = 188.0 - 144.0 = 44.0.',
            '2. Divide by number of dropped predictors q = 2: Numerator = 44.0 / 2 = 22.0.',
            '3. Denominator is MSE of the FULL model: MSE_full = 5.538.',
            '4. Partial F = 22.0 / 5.538 = 3.972 on (2, 26) df.',
            '5. Critical value from F-table at α = 0.05: F_{0.05, 2, 26} = 3.37.',
            '6. Decision: F_calc = 3.972 > 3.37 → Reject H₀. Conclude that displacement and gears significantly contribute to predicting fuel economy; do NOT drop them.',
          ],
          result: 'Partial F = 3.972 on (2, 26) df. Reject H₀; keep full model.',
          resultLatex: 'F = \\frac{(188.0 - 144.0)/2}{144.0 / 26} = \\frac{22.0}{5.538} = 3.972 > 3.37',
        },
        examPitfall:
          'Exam 3 formula sheet DOES NOT have the Partial F formula! You must write it on your cheat sheet. In the numerator, divide by q (dropped predictors), NOT k.',
        diagramOrVisual: `
  FULL MODEL (k predictors):    [====================] SSE_full (small noise)
  REDUCED MODEL (k-q predictors):[==========================] SSE_red (bigger noise)
                                                     <------>
                                       Difference = Extra SS due to dropped variables!
  Divide by q, scale by MSE_full  ==> Partial F Statistic
`,
      },
      interrogationPrompt:
        'Why can the overall F-test be highly significant (p < 0.001) while NONE of the individual predictor t-tests are significant (multicollinearity)?',
      feynmanPrompt:
        'Explain how two overlapping clues can confuse a detective on which clue matters more.',
      modelAnswer:
        'When predictors are highly correlated (multicollinearity), they share variance in predicting Y. Each individual t-test tests the MARGINAL contribution of predictor Xj GIVEN all other predictors are already in the model. Because the other predictors already contain most of Xj\'s information, Xj adds little unique variance, inflating SE(bj) and driving t-statistics to zero. The Partial F-test resolves this by testing a whole SUBSET of predictors simultaneously: F = [(SSE_red - SSE_full)/q] / MSE_full.',
      keyConcepts: [
        'Multicollinearity inflates standard errors of individual slopes',
        't-tests evaluate marginal contribution given other variables',
        'Partial F compares Full vs Reduced nested models',
      ],
      selfCheckQuestions: [
        'Write the formula for the Partial F-test for dropping q predictors.',
        'What degrees of freedom does the Partial F-statistic have?',
      ],
    },
    {
      id: 'ar-m5-6',
      topicIndex: 6,
      topicTitle: 'Coefficient of determination R² vs Adjusted R²_adj',
      module: 5,
      lesson: {
        intuitiveExplanation:
          'Regular R² = SSR / SST = 1 - SSE / SST tells you the proportion of total variance explained by your model. But regular R² has a dirty secret: every time you add a predictor—even complete random noise like the day\'s lottery numbers—OLS gets one more degree of freedom to wiggle and fit the sample data. Therefore, regular R² NEVER decreases when you add variables! It will always go up or stay flat. Adjusted R² (R²_adj) corrects for this by dividing SSE and SST by their respective degrees of freedom, penalizing you for adding junk variables. If the new predictor doesn\'t improve the fit by more than random chance, R²_adj drops.',
        coreRule:
          '• R² = 1 - (SSE / SST). Always 0 ≤ R² ≤ 1. Never decreases with added predictors.\n• R²_adj = 1 - [ MSE / MST ] = 1 - [ (SSE / (n - k - 1)) / (SST / (n - 1)) ].\n• R²_adj is strictly less than R² (R²_adj < R²). It CAN be negative if model is useless.\n• Adding a predictor increases R²_adj if and only if its individual t-statistic is |t| > 1.',
        latexFormula: 'R^2 = 1 - \\frac{SSE}{SST}, \\qquad R^2_{\\text{adj}} = 1 - \\frac{SSE / (n - k - 1)}{SST / (n - 1)} = 1 - \\left(\\frac{n-1}{n-k-1}\\right)(1 - R^2)',
        workedExample: {
          context: 'An analyst has n = 21 observations with SST = 1000. Model 1 has k = 2 predictors and SSE = 400. Model 2 adds k = 2 more junk predictors (k = 4 total), bringing SSE down slightly to 380.',
          stepByStep: [
            '1. Model 1 (k = 2): R² = 1 - (400/1000) = 0.600 (60.0%).\n   R²_adj = 1 - [(400 / (21 - 2 - 1)) / (1000 / 20)] = 1 - [(400 / 18) / 50] = 1 - (22.22 / 50) = 0.556 (55.6%).',
            '2. Model 2 (k = 4): R² = 1 - (380/1000) = 0.620 (62.0% -> regular R² went UP!).\n   R²_adj = 1 - [(380 / (21 - 4 - 1)) / (1000 / 20)] = 1 - [(380 / 16) / 50] = 1 - (23.75 / 50) = 0.525 (52.5% -> Adjusted R² went DOWN!).',
            '3. Conclusion: Model 1 is preferred. The 2 added predictors were useless noise that burned degrees of freedom without earning their keep.',
          ],
          result: 'Model 2 regular R² increased from 60% to 62%, but R²_adj dropped from 55.6% to 52.5%. Choose Model 1.',
          resultLatex: 'R^2_{\\text{adj}}(\\text{Mod 1}) = 0.556 \\quad > \\quad R^2_{\\text{adj}}(\\text{Mod 2}) = 0.525',
        },
        examPitfall:
          'Never use regular R² to compare models with different numbers of predictors. Always compare them using Adjusted R² or AIC.',
        diagramOrVisual: `
  Predictors Added:       k = 1       k = 2       k = 3       k = 4 (junk)
  Regular R²:             0.45  -->   0.60  -->   0.72  -->   0.73  (Always increases!)
  Adjusted R²_adj:        0.42  -->   0.56  -->   0.68  -->   0.64  (Drops when variable is junk!)
`,
      },
      interrogationPrompt:
        'Why does adding a completely useless predictor always increase (or never decrease) R², while R²_adj can decrease?',
      feynmanPrompt:
        'Explain why regular R² is a cheat metric for judging complex models.',
      modelAnswer:
        'R² = 1 - SSE/SST = SSR/SST. Adding any predictor gives OLS one more degree of freedom to fit the sample data, so SSE cannot increase. Regular R² will never go down. Adjusted R²_adj divides SSE by (n - k - 1) and SST by (n - 1), penalizing model complexity. If the variable does not reduce SSE by more than 1 MSE equivalent, R²_adj decreases.',
      keyConcepts: [
        'R² always increases with added predictors',
        'R²_adj penalizes model complexity via degrees of freedom',
        'R²_adj can be negative',
      ],
      selfCheckQuestions: [
        'Can R²_adj ever be greater than R²?',
        'Under what condition does adding a predictor increase R²_adj (what must its t-statistic be)?',
      ],
    },
    {
      id: 'ar-m5-7',
      topicIndex: 7,
      topicTitle: 'Akaike Information Criterion (AIC = n ln(SSE/n) + 2(k+1))',
      module: 5,
      lesson: {
        intuitiveExplanation:
          'Partial F-tests are wonderful, but they have one massive limitation: they ONLY work on nested models (where the reduced model is an exact subset of the full model). What if you want to compare Model A (predicting strength from carbon content) with Model B (predicting strength from cooling rate)? They share no predictors! The Akaike Information Criterion (AIC) solves this. It balances goodness-of-fit against a penalty for model complexity. A smaller (more negative) AIC indicates a better, more efficient model.',
        coreRule:
          '• Formula: AIC = n × ln(SSE / n) + 2(k + 1)\n  - n × ln(SSE / n) measures unexplained variation (lack of fit). Smaller SSE makes this term more negative.\n  - 2(k + 1) is the penalty term for estimating k + 1 parameters (intercept β₀, slopes β₁...β_k, and variance σ²).\n• Decision rule: MINIMUM AIC WINS. A difference ΔAIC > 2 gives strong evidence favoring the lower AIC model.\n• Key advantage over Partial F: Can compare non-nested models!',
        latexFormula: '\\text{AIC} = n \\ln\\left(\\frac{SSE}{n}\\right) + 2(k + 1)',
        workedExample: {
          context: 'Comparing two non-nested models for concrete curing time (n = 50):\nModel A (uses chemistry: k = 2 predictors): SSE = 250.\nModel B (uses environmental temps: k = 4 predictors): SSE = 220.',
          stepByStep: [
            '1. Model A (k = 2): AIC = 50 × ln(250 / 50) + 2(2 + 1) = 50 × ln(5.0) + 6 = 50 × (1.6094) + 6 = 80.47 + 6 = 86.47.',
            '2. Model B (k = 4): AIC = 50 × ln(220 / 50) + 2(4 + 1) = 50 × ln(4.4) + 10 = 50 × (1.4816) + 10 = 74.08 + 10 = 84.08.',
            '3. Difference: AIC_B - AIC_A = 84.08 - 86.47 = -2.39.',
            '4. Decision: Model B has a lower AIC by ΔAIC = 2.39 > 2. Even though Model B has 2 extra predictors, the reduction in SSE was large enough to overcome the 4-point parameter penalty. Select Model B.',
          ],
          result: 'Model B AIC = 84.08 < Model A AIC = 86.47. Model B is superior.',
          resultLatex: '\\text{AIC}_B = 84.08 < \\text{AIC}_A = 86.47 \\implies \\text{Choose Model B}',
        },
        examPitfall:
          'Do NOT look for the highest AIC! Unlike R², the BEST model has the LOWEST (or most negative) AIC. Also remember the "+ 1" inside 2(k + 1) for the intercept.',
        diagramOrVisual: `
  AIC Trade-off:
  Lack of Fit: n * ln(SSE/n)   ----(Wants low SSE)----+
                                                      |====> Total AIC (Seek MINIMUM!)
  Complexity Penalty: 2(k+1)   ----(Wants small k)----+
`,
      },
      interrogationPrompt:
        'How does AIC balance model goodness-of-fit against model complexity, and do we seek higher or lower AIC values?',
      feynmanPrompt:
        'Explain how AIC acts like a penalty referee when choosing between simple and complicated models.',
      modelAnswer:
        'AIC = n * ln(SSE/n) + 2(k + 1). The first term n*ln(SSE/n) measures lack-of-fit; as the model fits better and SSE shrinks, this term becomes smaller/more negative. The second term 2(k + 1) is a strict parsimony penalty for adding parameters. We ALWAYS seek the MINIMUM AIC model. It enables comparison of non-nested models.',
      keyConcepts: [
        'Smaller / more negative AIC is always better',
        'First term rewards fit (low SSE); second term penalizes complexity',
        'Allows non-nested model comparison (unlike Partial F)',
      ],
      selfCheckQuestions: [
        'Can you use AIC to compare non-nested models (e.g., Model A using X1 vs Model B using X2)?',
        'If Model 1 has AIC = 142.3 and Model 2 has AIC = 138.1, which model is preferred?',
      ],
    },
    {
      id: 'ar-m5-8',
      topicIndex: 8,
      topicTitle: 'Qualitative / dummy variable coding and interaction terms',
      module: 5,
      lesson: {
        intuitiveExplanation:
          'What happens when a predictor is categorical (like Machine Type A, B, C) instead of numeric? You cannot plug in 1, 2, 3 because that would falsely assume Machine C is "three times" Machine A! Instead, we create indicator dummy variables that equal 1 if present and 0 otherwise. If a categorical variable has c categories, you MUST include only c - 1 dummy variables. The omitted category becomes the "Baseline" or "Reference" category absorbed into the intercept β₀. If you add an interaction term (like x₁ × x₂), it means the effect of x₁ on y CHANGES depending on the level of x₂ (non-parallel lines!).',
        coreRule:
          '• For c levels: include c - 1 dummy variables. (Including all c dummies causes the "Dummy Variable Trap" / singular X\'X matrix).\n• Reference Level: The level with all dummies = 0. Its mean is represented by the intercept β₀.\n• Dummy Slope β_j: Represents the difference in expected response between category j and the reference category, holding all other variables constant.\n• Interaction Term β₃(x₁ × x₂): Represents a CHANGE IN SLOPE (non-parallel lines). If β₃ ≠ 0, you cannot interpret the effect of x₁ without specifying x₂!',
        latexFormula: '\\hat{y} = \\beta_0 + \\beta_1 x_1 + \\beta_2 D_2 + \\beta_3 (x_1 \\cdot D_2)',
        workedExample: {
          context: 'Predicting machine noise level (y, in dB) based on operating speed (x, in RPM) and coolant type (Standard vs Synthetic). Let D = 1 if Synthetic, D = 0 if Standard (Reference). Fitted model: ŷ = 50 + 0.05x - 8.0D - 0.01(x · D).',
          stepByStep: [
            '1. For Standard Coolant (D = 0): ŷ = 50 + 0.05x - 8(0) - 0.01(x · 0) = 50 + 0.05x.\n   - Base noise at 0 RPM = 50 dB; noise increases by 0.05 dB per RPM.',
            '2. For Synthetic Coolant (D = 1): ŷ = 50 + 0.05x - 8(1) - 0.01(x · 1) = (50 - 8) + (0.05 - 0.01)x = 42 + 0.04x.\n   - Base noise is 42 dB (8 dB lower than Standard!); noise increases at a gentler slope of 0.04 dB per RPM.',
            '3. Interpretation of interaction term (-0.01): Synthetic coolant reduces the rate at which speed increases noise by 0.01 dB/RPM.',
          ],
          result: 'Standard line: ŷ = 50 + 0.05x. Synthetic line: ŷ = 42 + 0.04x. Slopes are non-parallel due to interaction!',
          resultLatex: '\\text{Std: } 50 + 0.05x \\quad \\text{vs} \\quad \\text{Synth: } 42 + 0.04x',
        },
        examPitfall:
          'If a variable has 4 categories (e.g. North, South, East, West), how many dummies do you create? EXACTLY 3. If you include 4 dummies alongside an intercept, software crashes or drops one with "multicollinearity".',
        diagramOrVisual: `
     y (Noise)
      |                / Standard Coolant (D=0): ŷ = 50 + 0.05x
      |  50 dB -------/
      |              /   / Synthetic Coolant (D=1): ŷ = 42 + 0.04x (Lower & Gentler Slope!)
      |  42 dB -----/---/
      |            /   /
      +-----------+---+-----------------> x (Speed)
`,
      },
      interrogationPrompt:
        'Why does a categorical variable with c levels require exactly c - 1 dummy variables, and what does an interaction term X1*X2 represent physically?',
      feynmanPrompt:
        'Explain how dummy variables shift the intercept while interaction terms change the slope.',
      modelAnswer:
        'If all c dummies were included alongside an intercept β0, their sum would equal 1 (the intercept column), creating perfect multicollinearity (the dummy variable trap). The omitted level is the reference category absorbed into β0. Each dummy slope β_j represents the shift in mean response relative to baseline. An interaction term β3(X1*X2) means the effect of X1 depends on the value of X2, creating non-parallel lines.',
      keyConcepts: [
        'c levels requires c - 1 indicator variables',
        'Reference category is absorbed into intercept β0',
        'Interaction terms represent non-parallel slopes',
      ],
      selfCheckQuestions: [
        'If Shift has 3 levels (Day, Evening, Night) with Day as reference, how do you interpret β_Evening?',
        'In model ŷ = 10 + 2*Temp + 3*Catalyst + 4*(Temp*Catalyst), what is the slope with respect to Temp when Catalyst = 1?',
      ],
    },
  ],
};

// Add rich lessons for Modules 2, 3, 4, 6
activeRecallPrompts[2] = [
  {
    id: 'ar-m2-2',
    topicIndex: 2,
    topicTitle: "Bayes' Rule and Law of Total Probability",
    module: 2,
    lesson: {
      intuitiveExplanation:
        "Human intuition fails terribly at evaluating rare events. If a medical test is 99% accurate and you test positive for a rare disease that only 1 in 1000 people have, what is the probability you actually have the disease? Most people say 99%. In reality, it is under 10%! Why? Because the vast majority of people (999 out of 1000) are healthy. A 1% error rate on 999 healthy people creates about 10 false alarms, while the 99% accuracy on the 1 sick person yields only 1 true positive. Out of 11 total positive flags, only 1 is genuinely sick! Bayes' Rule combines the prior base rate with new test evidence to find the true posterior probability.",
      coreRule:
        "Bayes' Rule: P(B_j | A) = [ P(A | B_j) × P(B_j) ] / [ Σ P(A | B_i) × P(B_i) ].\nThe denominator is the Law of Total Probability: partitions the universe into mutually exclusive scenarios B_i.",
      latexFormula: 'P(B_j \\mid A) = \\frac{P(A \\mid B_j) P(B_j)}{\\sum_{i=1}^k P(A \\mid B_i) P(B_i)}',
      workedExample: {
        context: "A factory uses 3 machines: M1 produces 50% of parts (defect rate 2%), M2 produces 30% (defect rate 3%), M3 produces 20% (defect rate 5%). A randomly selected part is found DEFECTIVE (event D). What is the probability it came from M3?",
        stepByStep: [
          "1. Prior probabilities: P(M1) = 0.50, P(M2) = 0.30, P(M3) = 0.20.",
          "2. Likelihood of defect: P(D|M1) = 0.02, P(D|M2) = 0.03, P(D|M3) = 0.05.",
          "3. Law of Total Probability for denominator P(D):\n   P(D) = (0.50 × 0.02) + (0.30 × 0.03) + (0.20 × 0.05)\n        = 0.010 + 0.009 + 0.010 = 0.029 (2.9% overall defect rate).",
          "4. Apply Bayes' Rule for M3:\n   P(M3 | D) = [ P(D|M3) × P(M3) ] / P(D) = [ 0.05 × 0.20 ] / 0.029 = 0.010 / 0.029 = 0.3448.",
        ],
        result: "P(M3 | D) = 34.5%. Even though M3 has the highest defect rate (5%), it only produced 34.5% of defects because it made fewer total parts.",
        resultLatex: 'P(M_3 \\mid D) = \\frac{0.05 \\times 0.20}{0.029} = 0.3448 \\; (34.5\\%)',
      },
      examPitfall:
        "Never confuse P(A | B) with P(B | A)! P(Defective | Machine 3) = 0.05 is the test specification; P(Machine 3 | Defective) is what you must calculate using Bayes' Rule.",
      diagramOrVisual: `
  TREE DIAGRAM:
                 /--- P(M1)=0.50 ---> P(D|M1)=0.02  ===> 0.010
  All Parts ----+---- P(M2)=0.30 ---> P(D|M2)=0.03  ===> 0.009
                 \\--- P(M3)=0.20 ---> P(D|M3)=0.05  ===> 0.010
                                            Total Defect P(D) = 0.029
`,
    },
    interrogationPrompt:
      'Why does a diagnostic test with 99% accuracy still result in mostly false positives when the underlying disease prevalence is 0.1%?',
    feynmanPrompt:
      'Explain the base rate fallacy to a patient who just received a positive result on a rare-disease screening.',
    modelAnswer:
      'In Bayes\' Rule, the denominator is the Law of Total Probability. When disease prevalence is rare (0.1%), the vast healthy population produces far more false positives than the small sick population produces true positives. The prior base rate dominates!',
    keyConcepts: [
      'Base rate / Prior probability dominates rare outcomes',
      'Law of Total Probability partitions the sample space',
      'Posterior probability P(B|A) ≠ Likelihood P(A|B)',
    ],
    selfCheckQuestions: [
      'Write Bayes\' Rule for P(B_j | A) with k partitions.',
      'What is the difference between sensitivity P(+ | Disease) and positive predictive value P(Disease | +)?',
    ],
  },
  {
    id: 'ar-m2-4',
    topicIndex: 4,
    topicTitle: 'Expectation E[X], Variance Var(X), and Covariance Cov(X,Y)',
    module: 2,
    lesson: {
      intuitiveExplanation:
        'Expectation E[X] is a simple linear balance point: the average of a sum is ALWAYS the sum of averages, no matter how entangled or dependent the variables are: E[X + Y] = E[X] + E[Y]. But Variance is about squared deviations. When you add two variables, their uncertainties can either reinforce each other (if they move together, Cov > 0) or cancel each other out (if they move inversely, Cov < 0). That cross-talk is Covariance. If you assume independence when variables are actually correlated, your calculated risk will be catastrophically wrong.',
      coreRule:
        '• Linearity of Expectation: E[aX + bY + c] = aE[X] + bE[Y] + c (Always holds!).\n• Variance of Linear Combination: Var(aX + bY) = a²Var(X) + b²Var(Y) + 2ab·Cov(X,Y).\n• If X and Y are independent: Cov(X,Y) = 0, so Var(aX + bY) = a²Var(X) + b²Var(Y).\n• Notice: Var(X - Y) = Var(X) + Var(Y) - 2Cov(X,Y). If independent: Var(X - Y) = Var(X) + Var(Y) (variances always add!).',
      latexFormula: '\\text{Var}(aX + bY) = a^2 \\text{Var}(X) + b^2 \\text{Var}(Y) + 2ab \\text{Cov}(X,Y)',
      workedExample: {
        context: "A structural column carries dead load D and live load L. Var(D) = 16 kN², Var(L) = 25 kN², and Cov(D,L) = 8 kN² (because larger buildings carry more people). Find the variance of total load T = D + L.",
        stepByStep: [
          "1. Use formula with a = 1, b = 1:\n   Var(D + L) = 1²Var(D) + 1²Var(L) + 2(1)(1)Cov(D,L).",
          "2. Substitute values: Var(T) = 16 + 25 + 2(8) = 41 + 16 = 57 kN².",
          "3. Contrast with independence: If an engineer falsely assumed D and L were independent, they would calculate 16 + 25 = 41 kN², underestimating column variance by 28%!",
        ],
        result: "Var(D + L) = 57 kN². Standard deviation of total load = √57 = 7.55 kN.",
      },
      examPitfall:
        'Never write Var(X - Y) = Var(X) - Var(Y)! Variance can NEVER be subtracted. For independent variables, Var(X - Y) = 1²Var(X) + (-1)²Var(Y) = Var(X) + Var(Y).',
      diagramOrVisual: `
  Positive Covariance (Co-move):    X ↑ and Y ↑   ==> Errors reinforce!  Var(X+Y) > Var(X)+Var(Y)
  Negative Covariance (Hedge):      X ↑ and Y ↓   ==> Errors cancel!     Var(X+Y) < Var(X)+Var(Y)
  Zero Covariance (Independent):    X and Y decorrelated                Var(X+Y) = Var(X)+Var(Y)
`,
    },
    interrogationPrompt:
      'Why is E[aX + bY] = aE[X] + bE[Y] always true regardless of dependence, but Var(aX + bY) requires independence for cross-terms to vanish?',
    feynmanPrompt:
      'Explain why combining two volatile investments can either increase or decrease total risk.',
    modelAnswer:
      'Expectation is an integral of a sum, which splits linearly. Variance involves squaring deviations: Var(aX + bY) expands to a²Var(X) + b²Var(Y) + 2ab Cov(X,Y). Only when Cov = 0 does the interaction term vanish.',
    keyConcepts: [
      'Linearity of expectation holds unconditionally',
      'Var(aX + bY) = a²Var(X) + b²Var(Y) + 2ab Cov(X,Y)',
      'Variances add even when taking differences: Var(X - Y) = Var(X) + Var(Y)',
    ],
    selfCheckQuestions: [
      'If Var(X) = 4 and Var(Y) = 9, what is Var(2X - 3Y) if X and Y are independent?',
      'Can covariance be negative? What does negative covariance do to Var(X + Y)?',
    ],
  },
];

activeRecallPrompts[3] = [
  {
    id: 'ar-m3-1',
    topicIndex: 1,
    topicTitle: 'One-sample t-test and CI for μ (σ unknown)',
    module: 3,
    lesson: {
      intuitiveExplanation:
        "When standard deviation σ is known, the margin of error uses the standard normal bell curve Z. But in the real world, you never know true σ. You have to estimate it from the sample using s. Because your estimate of s changes randomly from sample to sample, your test statistic has TWO moving parts (x̄ on top, s on the bottom). William Gosset (publishing under the pen name 'Student' while working at Guinness Brewery) showed that this extra uncertainty fattens the tails of the distribution. The smaller your sample size n, the fatter the tails, and the wider your safety margin must be.",
      coreRule:
        "• Test statistic: t = (x̄ - μ₀) / (s / √n) ~ t_{n-1} with df = n - 1.\n• Confidence Interval for μ: x̄ ± t_{α/2, n-1} × (s / √n).\n• Lindberg Rule: If σ is UNKNOWN, ALWAYS use Student's t, never z (even if n > 30)!",
      latexFormula: 't = \\frac{\\bar{x} - \\mu_0}{s / \\sqrt{n}} \\sim t_{n-1}, \\qquad \\text{CI: } \\bar{x} \\pm t_{\\alpha/2, n-1} \\frac{s}{\\sqrt{n}}',
      workedExample: {
        context: "A structural steel batch has n = 16 beams tested for yield strength: x̄ = 345 MPa, s = 20 MPa. Test H₀: μ = 350 vs Hₐ: μ < 350 at α = 0.05.",
        stepByStep: [
          "1. Hypotheses: H₀: μ = 350 vs Hₐ: μ < 350 (one-sided lower-tail test).",
          "2. Degrees of freedom: df = n - 1 = 16 - 1 = 15.",
          "3. Standard error: SE = s / √n = 20 / √16 = 20 / 4 = 5.0 MPa.",
          "4. Compute t-statistic: t = (345 - 350) / 5.0 = -5.0 / 5.0 = -1.00.",
          "5. Critical value from t-table at α = 0.05 and df = 15: -t_{0.05, 15} = -1.753.",
          "6. Decision: -1.00 is NOT in the rejection region (-1.00 > -1.753). Fail to reject H₀. There is insufficient evidence that the mean strength is below 350 MPa.",
        ],
        result: "t = -1.00; Fail to reject H₀ at α = 0.05. 95% CI is 345 ± 2.131(5) = [334.3, 355.7] MPa.",
      },
      examPitfall:
        "For a one-sided test at α = 0.05, look up t_{0.05, df} (1.753), NOT t_{0.025, df} (2.131)! Only use α/2 for two-sided tests.",
      diagramOrVisual: `
           Normal Z curve (narrow tails) vs Student's t curve (fat tails):
                   |      _--_
                   |    /   |  \\      <-- Normal Z
                   |   /  _---_ \\     <-- Student's t (fatter tails!)
                ___|__/_______\\___
                 -3  -2  -1 0 1 2 3
`,
    },
    interrogationPrompt:
      'Why does Student\'s t-distribution have heavier tails than the standard normal distribution, and when do they become indistinguishable?',
    feynmanPrompt:
      'Why do we need a wider safety margin when we have to estimate the variance from a small sample?',
    modelAnswer:
      'In t = (x̄ - μ)/(s/√n), both numerator and denominator are random variables with sampling variability. Estimating s adds extra variability, fattening the tails. As df → ∞, s converges to σ and t converges to standard normal Z.',
    keyConcepts: [
      'df = n - 1',
      'Heavier tails account for estimating s',
      'Requires population normality (or n ≥ 30)',
    ],
    selfCheckQuestions: [
      'What is the formula for the t-confidence interval for μ?',
      'If a 95% CI for μ is [42, 48], what is the outcome of testing H0: μ = 50 at α = 0.05?',
    ],
  },
];

activeRecallPrompts[4] = [
  {
    id: 'ar-m4-1',
    topicIndex: 1,
    topicTitle: 'Welch Two-Sample t-test (unequal variances, Satterthwaite df)',
    module: 4,
    lesson: {
      intuitiveExplanation:
        "When comparing two independent groups, textbooks often teach the Pooled t-test. But pooling assumes both populations have the exact same variance σ₁² = σ₂². In the real world, two different factories or materials rarely have identical variances. If Factory B has 3× the variance of Factory A and smaller sample size, pooling severely inflates false-positive rates (Type I error). Welch's t-test never pools: it divides by √(s₁²/n₁ + s₂²/n₂). Because this ratio isn't a clean chi-square, Satterthwaite derived an effective degrees of freedom formula (ν). You ALWAYS round ν DOWN to the nearest integer to be conservative.",
      coreRule:
        "• When to use: Two independent samples with unequal variances (rule of thumb: max(s₁,s₂)/min(s₁,s₂) > 2).\n• Test statistic: t = (x̄₁ - x̄₂) / √(s₁²/n₁ + s₂²/n₂).\n• Satterthwaite df ν = (s₁²/n₁ + s₂²/n₂)² / [ (s₁²/n₁)²/(n₁-1) + (s₂²/n₂)²/(n₂-1) ].\n• CRITICAL: Round ν DOWN to nearest integer!\n• Warning: Exam 3 formula sheet DOES NOT have Welch t! You must bring it on your cheat sheet.",
      latexFormula: 't = \\frac{\\bar{x}_1 - \\bar{x}_2}{\\sqrt{s_1^2/n_1 + s_2^2/n_2}}, \\qquad \\nu = \\frac{\\left(\\frac{s_1^2}{n_1} + \\frac{s_2^2}{n_2}\\right)^2}{\\frac{(s_1^2/n_1)^2}{n_1 - 1} + \\frac{(s_2^2/n_2)^2}{n_2 - 1}}',
      workedExample: {
        context: "Comparing concrete curing strengths from Supplier 1 (n₁ = 10, x̄₁ = 45 MPa, s₁ = 4 MPa) and Supplier 2 (n₂ = 8, x̄₂ = 38 MPa, s₂ = 10 MPa). Here s₂/s₁ = 10/4 = 2.5 > 2 → Unequal variances!",
        stepByStep: [
          "1. Check variances: s₁² = 16, s₂² = 100. s₁²/n₁ = 1.6, s₂²/n₂ = 12.5.",
          "2. Standard error: SE = √(1.6 + 12.5) = √14.1 = 3.755 MPa.",
          "3. Difference in means: x̄₁ - x̄₂ = 45 - 38 = 7.0 MPa.",
          "4. Compute t: t = 7.0 / 3.755 = 1.864.",
          "5. Compute Satterthwaite df ν:\n   Numerator = (1.6 + 12.5)² = (14.1)² = 198.81.\n   Denominator = (1.6)²/9 + (12.5)²/7 = 2.56/9 + 156.25/7 = 0.2844 + 22.321 = 22.605.\n   ν = 198.81 / 22.605 = 8.79 → ROUND DOWN TO ν = 8!",
          "6. Critical value: t_{0.025, 8} = 2.306. Since |1.864| < 2.306, fail to reject H₀.",
        ],
        result: "t = 1.864, df = 8 (rounded down). Fail to reject H₀ at α = 0.05.",
      },
      examPitfall:
        "If you round ν up (e.g. 8.79 up to 9), your critical value is too small and you lose points for anti-conservative degrees of freedom. Always truncate/round DOWN.",
      diagramOrVisual: `
  DECISION TREE: TWO INDEPENDENT MEANS
  Are variances equal?
        |
        +--- YES (or stated equal) ---> Pooled t-test (df = n₁ + n₂ - 2)
        |
        +--- NO (or s₂/s₁ > 2)    ---> Welch t-test (Satterthwaite df, round DOWN!)
`,
    },
    interrogationPrompt:
      'How does Welch\'s t-test adjust for unequal variances, and why must Satterthwaite degrees of freedom be rounded DOWN?',
    feynmanPrompt:
      'Explain how Welch\'s test protects you against being fooled by different spreads in two groups.',
    modelAnswer:
      'Welch t uses separate variances SE = √(s1²/n1 + s2²/n2). Satterthwaite approximates the effective degrees of freedom ν by moment matching. Rounding ν DOWN is conservative, ensuring the critical value is slightly larger and Type I error never exceeds α.',
    keyConcepts: [
      'SE = √(s1²/n1 + s2²/n2)',
      'Satterthwaite df formula',
      'Always round ν DOWN to stay conservative',
    ],
    selfCheckQuestions: [
      'Is Welch\'s test on the Exam 3 formula sheet? (Where must you carry it?)',
      'Can Satterthwaite df ever exceed (n1 + n2 - 2)?',
    ],
  },
];

activeRecallPrompts[6] = [
  {
    id: 'ar-m6-0',
    topicIndex: 0,
    topicTitle: 'Completely Randomized Design (CRD / One-Way ANOVA)',
    module: 6,
    lesson: {
      intuitiveExplanation:
        "Suppose you want to compare k = 5 different machine types. Why not just run two-sample t-tests on all pairs? With 5 groups, there are 10 pairs! If each individual test has a 5% false-positive rate (α = 0.05), the probability of getting AT LEAST ONE false alarm is 1 - (1 - 0.05)¹⁰ ≈ 40%! You would have a 40% chance of declaring a fake difference. One-Way ANOVA solves this by testing all group means simultaneously in a single 'omnibus' test, holding the overall false-positive rate strictly at 5%.",
      coreRule:
        "• Hypotheses: H₀: μ₁ = μ₂ = ... = μ_k vs Hₐ: At least two group means differ.\n• Decomposition: SST = SSTrt + SSE.\n• Degrees of freedom: Trt df = k - 1, Error df = N - k, Total df = N - 1.\n• F-statistic: F = MSTrt / MSE = [SSTrt / (k - 1)] / [SSE / (N - k)] ~ F_{k-1, N-k}.\n• If F rejects: Proceed to Tukey HSD for pairwise follow-ups. If F fails to reject: STOP (no differences exist).",
      latexFormula: 'F = \\frac{MSTrt}{MSE} = \\frac{SSTrt / (k - 1)}{SSE / (N - k)} \\sim F_{k-1, \\, N-k}',
      workedExample: {
        context: "Comparing k = 3 heat treatment methods with n = 5 specimens per group (total N = 15). Summary: SSTrt = 80, SSE = 48.",
        stepByStep: [
          "1. Treatment df = k - 1 = 3 - 1 = 2.",
          "2. Error df = N - k = 15 - 3 = 12.",
          "3. Total df = N - 1 = 14; Total SS = 80 + 48 = 128.",
          "4. MSTrt = 80 / 2 = 40.0.",
          "5. MSE = 48 / 12 = 4.0.",
          "6. F-statistic = MSTrt / MSE = 40.0 / 4.0 = 10.00 on (2, 12) df.",
          "7. Critical value from F-table: F_{0.05, 2, 12} = 3.89.",
          "8. Decision: F = 10.00 > 3.89 → Reject H₀. At least two heat treatments produce significantly different mean strengths.",
        ],
        result: "F = 10.00 on (2, 12) df. Reject H₀; proceed to Tukey pairwise comparisons.",
      },
      examPitfall:
        "Never run Tukey pairwise tests if the overall ANOVA F-test fails to reject H₀! You are only permitted to investigate pairwise differences if omnibus F was significant.",
      diagramOrVisual: `
  ANOVA PARTITION:
  [================== Total Variation SST (df = N-1) ==================]
  [===== Between Groups SSTrt (df = k-1) =====][== Within Groups SSE (df = N-k) ==]
                       |                                     |
                 MSTrt = SSTrt / (k-1)                  MSE = SSE / (N-k)
                       \\___________________  ________________/
                                           \\/
                                     F = MSTrt / MSE
`,
    },
    interrogationPrompt:
      'Why can\'t you just perform multiple pairwise two-sample t-tests to compare k group means instead of running a One-Way ANOVA?',
    feynmanPrompt:
      'Explain familywise error: why rolling a 20-sided die 10 times makes rolling at least one 1 almost certain.',
    modelAnswer:
      'Multiple t-tests inflate familywise error: α_family ≈ 1 - (1 - α)^C. Comparing 5 groups gives 10 pairs and ~40% false positive risk! ANOVA tests H₀: μ₁=...=μk in a single omnibus test, controlling α at the nominal level.',
    keyConcepts: [
      'Multiple t-tests inflate familywise error: α_family ≈ 1 - (1 - α)^C',
      'ANOVA provides single omnibus test',
      'H0: all means equal; Ha: at least one mean differs',
    ],
    selfCheckQuestions: [
      'How many pairwise comparisons exist for k = 4 groups?',
      'If the ANOVA F-test fails to reject H0, are you permitted to run post-hoc Tukey tests?',
    ],
  },
];

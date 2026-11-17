import type { DerivationProof } from '@/types';

export const derivations: DerivationProof[] = [
  {
    id: 'dojo-01',
    pattern: 1,
    title: 'Sampling Distribution of Slope Estimator β̂₁ & Cov(Ȳ, β̂₁) = 0',
    description:
      'Prove that under the Gauss-Markov LINE assumptions, β̂₁ = ∑ k_i Y_i is an unbiased estimator with Var(β̂₁) = σ²/SSxx, and that sample mean Ȳ is uncorrelated with slope β̂₁.',
    steps: [
      {
        id: 'd1-s1',
        content: 'Express the OLS slope estimator as a linear combination of response variables Y_i: β̂₁ = ∑ k_i Y_i where weights k_i = (x_i - x̄) / SSxx.',
        latex: '\\hat{\\beta}_1 = \\frac{\\sum (x_i - \\bar{x})(Y_i - \\bar{Y})}{\\sum (x_i - \\bar{x})^2} = \\sum k_i Y_i, \\quad k_i = \\frac{x_i - \\bar{x}}{SS_{xx}}',
        explanation: 'Note that ∑ k_i = ∑(x_i - x̄)/SSxx = 0, and ∑ k_i x_i = ∑(x_i - x̄)x_i/SSxx = SSxx/SSxx = 1.',
      },
      {
        id: 'd1-s2',
        content: 'Prove unbiasedness by taking expectation E[β̂₁]:',
        latex: 'E[\\hat{\\beta}_1] = \\sum k_i E[Y_i] = \\sum k_i (\\beta_0 + \\beta_1 x_i) = \\beta_0 \\sum k_i + \\beta_1 \\sum k_i x_i = 0 + \\beta_1(1) = \\beta_1',
        explanation: 'Because the weights sum to zero (∑ k_i = 0), the intercept term disappears, proving unbiasedness.',
      },
      {
        id: 'd1-s3',
        content: 'Derive the variance using independence of Y_i (Var(Y_i) = σ²):',
        latex: 'Var(\\hat{\\beta}_1) = \\sum k_i^2 Var(Y_i) = \\sigma^2 \\sum \\left(\\frac{x_i - \\bar{x}}{SS_{xx}}\\right)^2 = \\sigma^2 \\frac{SS_{xx}}{SS_{xx}^2} = \\frac{\\sigma^2}{SS_{xx}}',
        explanation: 'The precision of the slope estimator increases directly with SSxx (the spread of the x-values).',
      },
      {
        id: 'd1-s4',
        content: 'Prove Cov(Ȳ, β̂₁) = 0 by expressing both as linear combinations of Y_i:',
        latex: 'Cov(\\bar{Y}, \\hat{\\beta}_1) = Cov\\left(\\sum \\frac{1}{n} Y_i, \\sum k_i Y_j\\right) = \\sum_{i=1}^n \\frac{k_i}{n} Var(Y_i) = \\frac{\\sigma^2}{n} \\sum k_i = \\frac{\\sigma^2}{n} (0) = 0',
        explanation: 'Under normality, zero covariance implies independence between Ȳ and β̂₁, which is critical for deriving the t-distribution.',
      },
    ],
  },
  {
    id: 'dojo-02',
    pattern: 2,
    title: 'Regression Identities: β̂₁ = r(s_y/s_x), SSR = β̂₁² SSxx, and R² = r²',
    description:
      'Prove the fundamental algebraic bridge between Pearson sample correlation coefficient r and Simple Linear Regression coefficients.',
    steps: [
      {
        id: 'd2-s1',
        content: 'Relate the OLS slope b₁ directly to the Pearson correlation coefficient r:',
        latex: 'r = \\frac{SS_{xy}}{\\sqrt{SS_{xx} SS_{yy}}} \\implies b_1 = \\frac{SS_{xy}}{SS_{xx}} = r \\frac{\\sqrt{SS_{xx} SS_{yy}}}{SS_{xx}} = r \\sqrt{\\frac{SS_{yy}/(n-1)}{SS_{xx}/(n-1)}} = r \\frac{s_y}{s_x}',
        explanation: 'Slope b₁ has the same sign as r and equals r scaled by the ratio of standard deviations.',
      },
      {
        id: 'd2-s2',
        content: 'Derive the Regression Sum of Squares SSR in terms of b₁ and SSxx:',
        latex: 'SSR = \\sum (\\hat{y}_i - \\bar{y})^2 = \\sum [(\\bar{y} + b_1(x_i - \\bar{x})) - \\bar{y}]^2 = b_1^2 \\sum (x_i - \\bar{x})^2 = b_1^2 SS_{xx}',
        explanation: 'Because b₁ = SSxy/SSxx, SSR = (SSxy/SSxx)² SSxx = SSxy² / SSxx.',
      },
      {
        id: 'd2-s3',
        content: 'Show that the coefficient of determination R² in SLR equals r²:',
        latex: 'R^2 = \\frac{SSR}{SST} = \\frac{SS_{xy}^2 / SS_{xx}}{SS_{yy}} = \\left(\\frac{SS_{xy}}{\\sqrt{SS_{xx} SS_{yy}}}\\right)^2 = r^2',
        explanation: 'In Simple Linear Regression, the proportion of explained variance R² is exactly the square of Pearson correlation r.',
      },
    ],
  },
  {
    id: 'dojo-03',
    pattern: 3,
    title: 'Centering Predictor Z = X - x̄: Invariance of Slope, Residuals & R²',
    description:
      'Show that subtracting sample mean x̄ from the predictor shifts the intercept to a₀ = ȳ without altering slope, predicted values ŷ_i, residuals, or R².',
    steps: [
      {
        id: 'd3-s1',
        content: 'Fit the centered model y_i = a₀ + a₁ z_i + ε_i where z_i = x_i - x̄:',
        latex: '\\bar{z} = \\frac{1}{n}\\sum (x_i - \\bar{x}) = 0, \\quad SS_{zz} = \\sum (z_i - 0)^2 = \\sum (x_i - \\bar{x})^2 = SS_{xx}',
        explanation: 'Centering places the new origin directly at the center of mass of the predictors.',
      },
      {
        id: 'd3-s2',
        content: 'Solve for the centered slope a₁ and centered intercept a₀:',
        latex: 'a_1 = \\frac{SS_{zy}}{SS_{zz}} = \\frac{\\sum z_i (y_i - \\bar{y})}{SS_{xx}} = \\frac{SS_{xy}}{SS_{xx}} = b_1, \\quad a_0 = \\bar{y} - a_1 \\bar{z} = \\bar{y} - b_1(0) = \\bar{y}',
        explanation: 'The centered slope is identical to the original slope (a₁ = b₁), and the new intercept is simply sample mean ȳ.',
      },
      {
        id: 'd3-s3',
        content: 'Verify that fitted values and residuals are completely invariant:',
        latex: '\\hat{y}_i^{(centered)} = a_0 + a_1 z_i = \\bar{y} + b_1(x_i - \\bar{x}) = \\hat{y}_i, \\quad e_i^{(centered)} = y_i - \\hat{y}_i^{(centered)} = e_i',
        explanation: 'Since fitted values and residuals are untouched, SSE, SSR, R², and t-statistics are strictly invariant under translation.',
      },
    ],
  },
  {
    id: 'dojo-04',
    pattern: 4,
    title: 'Adding (x̄, ȳ) to Dataset: Effect on β̂₁, SSE, and MSE',
    description:
      'Prove that appending the centroid point (x̄, ȳ) to a sample of n points leaves slope β̂₁ and SSE unchanged, but strictly decreases MSE.',
    steps: [
      {
        id: 'd4-s1',
        content: 'Evaluate the new sums of squares with the (n+1)-th point (x_{n+1}, y_{n+1}) = (x̄, ȳ):',
        latex: '\\bar{x}^* = \\bar{x}, \\quad \\bar{y}^* = \\bar{y}, \\quad SS_{xx}^* = \\sum_{i=1}^n (x_i - \\bar{x})^2 + (\\bar{x} - \\bar{x})^2 = SS_{xx}',
        explanation: 'Because the new point sits at the mean, deviation (x_{n+1} - x̄) = 0, so SSxx* = SSxx and SSxy* = SSxy.',
      },
      {
        id: 'd4-s2',
        content: 'Determine the new slope b₁* and new intercept b₀*:',
        latex: 'b_1^* = \\frac{SS_{xy}^*}{SS_{xx}^*} = \\frac{SS_{xy}}{SS_{xx}} = b_1, \\quad b_0^* = \\bar{y}^* - b_1^* \\bar{x}^* = \\bar{y} - b_1\\bar{x} = b_0',
        explanation: 'The regression line is identical: ŷ* = ŷ.',
      },
      {
        id: 'd4-s3',
        content: 'Evaluate the new residual for the centroid point and new SSE*:',
        latex: 'e_{n+1} = \\bar{y} - (b_0 + b_1\\bar{x}) = \\bar{y} - \\bar{y} = 0 \\implies SSE^* = \\sum_{i=1}^n e_i^2 + 0^2 = SSE',
        explanation: 'The new point lies exactly on the regression line, adding zero to the sum of squared errors.',
      },
      {
        id: 'd4-s4',
        content: 'Compare the Mean Squared Error MSE* against original MSE:',
        latex: 'MSE^* = \\frac{SSE^*}{(n+1) - 2} = \\frac{SSE}{n - 1} < \\frac{SSE}{n - 2} = MSE',
        explanation: 'Because the numerator is unchanged while the degrees of freedom increases by 1, MSE strictly decreases (MSE* < MSE).',
      },
    ],
  },
  {
    id: 'dojo-05',
    pattern: 5,
    title: 'Model Comparison Identity: R²_adj Increases ⟺ Partial F > 1',
    description:
      'Prove the mathematical equivalence between the Adjusted R² criterion and the Partial F-statistic when adding a single predictor to a regression model.',
    steps: [
      {
        id: 'd5-s1',
        content: 'Express Adjusted R² in terms of Mean Squared Error and Total Mean Square:',
        latex: 'R^2_{adj} = 1 - \\frac{SSE / (n - k - 1)}{SST / (n - 1)} = 1 - \\frac{MSE}{s_y^2}',
        explanation: 'Because sample variance s_y² = SST/(n-1) is fixed by the dataset, maximizing R²_adj is mathematically identical to minimizing MSE.',
      },
      {
        id: 'd5-s2',
        content: 'Examine the change in MSE when adding 1 predictor (k_F = k_R + 1):',
        latex: 'MSE_F < MSE_R \\iff \\frac{SSE_F}{n - k_F - 1} < \\frac{SSE_R}{n - k_R - 1} = \\frac{SSE_F + (SSE_R - SSE_F)}{n - k_F}',
        explanation: 'The added predictor must reduce SSE by more than the average residual variance per degree of freedom.',
      },
      {
        id: 'd5-s3',
        content: 'Rearrange the inequality to reveal the Partial F-statistic:',
        latex: '\\frac{SSE_R - SSE_F}{1} > \\frac{SSE_F}{n - k_F - 1} \\iff \\frac{(SSE_R - SSE_F)/1}{MSE_F} > 1 \\iff F_{partial} > 1',
        explanation: 'Therefore, R²_adj increases if and only if the Partial F-statistic for that added variable exceeds 1.0 (equivalent to |t| > 1).',
      },
    ],
  },
  {
    id: 'dojo-06',
    pattern: 6,
    title: 'Variance of Difference in Mean Responses: Var(μ̂_{Y|x_B} - μ̂_{Y|x_A})',
    description:
      'Derive the variance of the estimated difference in mean response at two distinct values of predictor x, and show its equivalence to testing β₁ = 0.',
    steps: [
      {
        id: 'd6-s1',
        content: 'Express the estimated difference in mean response Δ̂ = μ̂_{Y|x_B} - μ̂_{Y|x_A}:',
        latex: '\\hat{\\Delta} = (b_0 + b_1 x_B) - (b_0 + b_1 x_A) = b_1 (x_B - x_A)',
        explanation: 'The intercept b₀ cancels out completely because the line is evaluated at both points.',
      },
      {
        id: 'd6-s2',
        content: 'Compute the variance of Δ̂ using the variance of slope estimator b₁:',
        latex: 'Var(\\hat{\\Delta}) = Var(b_1(x_B - x_A)) = (x_B - x_A)^2 Var(b_1) = (x_B - x_A)^2 \\frac{\\sigma^2}{SS_{xx}}',
        explanation: 'The uncertainty in the difference is directly proportional to the squared distance (x_B - x_A)²',
      },
      {
        id: 'd6-s3',
        content: 'Form the t-test statistic for H₀: μ_{Y|x_B} = μ_{Y|x_A}:',
        latex: 't = \\frac{\\hat{\\Delta} - 0}{\\sqrt{MSE \\cdot (x_B - x_A)^2 / SS_{xx}}} = \\frac{b_1(x_B - x_A)}{(x_B - x_A)\\sqrt{MSE/SS_{xx}}} = \\frac{b_1}{\\sqrt{MSE/SS_{xx}}} = t_{b_1}',
        explanation: 'Testing whether the mean response differs at two distinct x-values is strictly equivalent to the standard t-test for slope β₁ = 0.',
      },
    ],
  },
  {
    id: 'dojo-07',
    pattern: 7,
    title: 'Poisson–Exponential Duality & Conditional Binomial Distribution',
    description:
      'Prove that the interarrival time T of a Poisson process is Exponentially distributed, and prove that conditioning independent Poisson RVs on their sum yields a Binomial distribution.',
    steps: [
      {
        id: 'd7-s1',
        content: 'Derive the CDF of waiting time T until the first event in a Poisson process with rate λ:',
        latex: 'P(T > t) = P(\\text{zero events in interval } [0, t]) = \\frac{(\\lambda t)^0 e^{-\\lambda t}}{0!} = e^{-\\lambda t}',
        explanation: 'The probability that waiting time exceeds t is identical to observing zero Poisson arrivals in [0, t].',
      },
      {
        id: 'd7-s2',
        content: 'Obtain the Exponential CDF and PDF:',
        latex: 'F_T(t) = P(T \\le t) = 1 - e^{-\\lambda t} \\implies f_T(t) = \\frac{d}{dt}F_T(t) = \\lambda e^{-\\lambda t}, \\quad t \\ge 0',
        explanation: 'This establishes the fundamental duality: Poisson counts ⟺ Exponential waiting times.',
      },
      {
        id: 'd7-s3',
        content: 'Let Y₁ ~ Poisson(μ₁) and Y₂ ~ Poisson(μ₂) be independent. Find the conditional distribution of Y₁ given Y₁ + Y₂ = m:',
        latex: 'P(Y_1 = k \\mid Y_1 + Y_2 = m) = \\frac{P(Y_1 = k) P(Y_2 = m - k)}{P(Y_1 + Y_2 = m)} = \\frac{\\frac{e^{-\\mu_1}\\mu_1^k}{k!} \\frac{e^{-\\mu_2}\\mu_2^{m-k}}{(m-k)!}}{\\frac{e^{-(\\mu_1+\\mu_2)}(\\mu_1+\\mu_2)^m}{m!}}',
        explanation: 'Use the fact that the sum of independent Poisson RVs is Poisson(μ₁ + μ₂).',
      },
      {
        id: 'd7-s4',
        content: 'Simplify the fraction to reveal the Binomial PMF:',
        latex: '= \\frac{m!}{k!(m-k)!} \\frac{\\mu_1^k \\mu_2^{m-k}}{(\\mu_1+\\mu_2)^m} = \\binom{m}{k} \\left(\\frac{\\mu_1}{\\mu_1+\\mu_2}\\right)^k \\left(\\frac{\\mu_2}{\\mu_1+\\mu_2}\\right)^{m-k} \\sim \\text{Bin}\\left(m, \\frac{\\mu_1}{\\mu_1+\\mu_2}\\right)',
        explanation: 'Conditioning on the total arrival count distributes the arrivals binomially according to the relative rate ratio.',
      },
    ],
  },
  {
    id: 'dojo-08',
    pattern: 8,
    title: 'Paired Design Precision Gain: Var(Y - X) with Positive Covariance',
    description:
      'Prove mathematically why pairing reduces variance and increases statistical power whenever experimental units share positive covariance Cov(X, Y) > 0.',
    steps: [
      {
        id: 'd8-s1',
        content: 'Compute the variance of difference D = Y - X under dependent paired sampling:',
        latex: 'Var(D) = Var(Y - X) = Var(Y) + Var(X) - 2 Cov(X, Y)',
        explanation: 'Because both measurements are taken on the same unit, they are correlated with covariance Cov(X, Y) = ρ σ_X σ_Y.',
      },
      {
        id: 'd8-s2',
        content: 'Compare with the variance of the difference between two independent samples of the same size:',
        latex: 'Var(\\bar{Y} - \\bar{X})_{indep} = \\frac{\\sigma_Y^2}{n} + \\frac{\\sigma_X^2}{n}, \\quad Var(\\bar{D})_{paired} = \\frac{\\sigma_Y^2 + \\sigma_X^2 - 2\\rho\\sigma_X\\sigma_Y}{n}',
        explanation: 'When ρ > 0 (as is standard for repeat measurements on the same subject), the -2ρσ_Xσ_Y term strictly reduces error variance.',
      },
      {
        id: 'd8-s3',
        content: 'State the engineering trade-off of the paired design:',
        latex: 'Var(\\bar{D})_{paired} < Var(\\bar{Y} - \\bar{X})_{indep} \\iff \\rho > 0',
        explanation: 'Pairing sacrifices (n - 1) degrees of freedom (df = n - 1 vs 2n - 2), but whenever correlation ρ > 0 is substantial, the drastic reduction in SE far outweighs the loss of df.',
      },
    ],
  },
];

/**
 * Math Solver Service
 *
 * The core mathematical computation engine using Math.js. Routes problems
 * to the appropriate solver based on category and returns a standardized
 * result object.
 *
 * @module solverService
 */

const math = require('mathjs')
const { splitEquation } = require('../utils/latexParser')

const TOLERANCE = 1e-10

/**
 * Solve a problem based on its category.
 *
 * @param {string} expression - The parsed Math.js-compatible expression.
 * @param {string} category - The problem category from the classifier.
 * @param {object} metadata - Metadata from the classifier.
 * @returns {object} The standardized solution result.
 */
function solveProblem(expression, category, metadata = {}) {
  try {
    switch (category) {
      case 'arithmetic':
      case 'evaluation':
        return solveArithmetic(expression, category)
      case 'linear_equation': {
        const { lhs, rhs } = splitEquation(expression)
        const variable = metadata.variables && metadata.variables[0]
        return solveLinearEquation(lhs, rhs, variable, category)
      }
      case 'quadratic_equation': {
        const { lhs, rhs } = splitEquation(expression)
        const variable = metadata.variables && metadata.variables[0]
        return solveQuadraticEquation(lhs, rhs, variable, category)
      }
      case 'polynomial_equation': {
        const { lhs, rhs } = splitEquation(expression)
        const variable = metadata.variables && metadata.variables[0]
        return solvePolynomialEquation(lhs, rhs, variable, category)
      }
      case 'expression_simplification':
        return simplifyExpression(expression, category)
      case 'trigonometric_expression':
      case 'trigonometric_equation':
        return solveTrigonometric(expression, category)
      case 'unsupported':
        return unsupportedResult(category)
      default:
        return {
          answer: 'Could not solve',
          numericAnswer: null,
          steps: [],
          method: 'unknown',
          category,
          error: 'Unsupported problem category'
        }
    }
  } catch (error) {
    console.error(`[solver] Error solving ${category}:`, error.message)
    return {
      answer: 'Could not solve',
      numericAnswer: null,
      steps: [],
      method: 'error',
      category,
      error: error.message
    }
  }
}

/**
 * Solve a pure numeric expression.
 *
 * @param {string} expression - The numeric expression.
 * @param {string} category - The problem category.
 * @returns {object} The solution result.
 */
function solveArithmetic(expression, category) {
  const result = math.evaluate(expression)
  const numeric = roundResult(result)

  if (!Number.isFinite(numeric)) {
    return {
      answer: 'Division by zero is undefined',
      numericAnswer: null,
      steps: [],
      method: 'arithmetic',
      category,
      error: 'Division by zero is undefined'
    }
  }

  return {
    answer: String(numeric),
    numericAnswer: numeric,
    steps: [
      { step: 1, description: 'Evaluate the expression', expression: String(numeric) }
    ],
    method: 'arithmetic',
    category
  }
}

/**
 * Solve a linear equation of the form ax + b = c.
 *
 * @param {string} lhs - The left-hand side.
 * @param {string} rhs - The right-hand side.
 * @param {string} variable - The variable name.
 * @param {string} category - The problem category.
 * @returns {object} The solution result.
 */
function solveLinearEquation(lhs, rhs, variable, category) {
  if (!variable) {
    return {
      answer: 'Could not solve',
      numericAnswer: null,
      steps: [],
      method: 'linear_solve',
      category,
      error: 'No variable found'
    }
  }

  // Create the equation: lhs - rhs = 0
  const equation = `(${lhs}) - (${rhs})`
  const simplified = math.simplify(equation).toString()

  // Use the f(0)/f(1) trick to extract a and b from ax + b = 0.
  const scope0 = { [variable]: 0 }
  const scope1 = { [variable]: 1 }
  const b = math.evaluate(simplified, scope0)
  const aPlusB = math.evaluate(simplified, scope1)
  const a = aPlusB - b

  const steps = []

  if (Math.abs(a) < TOLERANCE) {
    if (Math.abs(b) < TOLERANCE) {
      return {
        answer: 'Infinite solutions',
        numericAnswer: null,
        steps: [{ step: 1, description: 'The equation is an identity', expression: simplified }],
        method: 'linear_solve',
        category
      }
    }
    return {
      answer: 'No solution',
      numericAnswer: null,
      steps: [{ step: 1, description: 'The equation is a contradiction', expression: simplified }],
      method: 'linear_solve',
      category
    }
  }

  const result = -b / a

  // Build descriptive steps.
  steps.push({
    step: 1,
    description: `Move all terms with ${variable} to the left side`,
    expression: simplified
  })
  steps.push({
    step: 2,
    description: 'Move all constant terms to the right side',
    expression: `${a}*${variable} = ${-b}`
  })
  steps.push({
    step: 3,
    description: 'Simplify both sides',
    expression: `${a}*${variable} = ${-b}`
  })
  steps.push({
    step: 4,
    description: `Divide both sides by the coefficient of ${variable}`,
    expression: `${variable} = ${roundResult(result)}`
  })

  return {
    answer: `${variable} = ${roundResult(result)}`,
    numericAnswer: roundResult(result),
    steps,
    method: 'linear_solve',
    category
  }
}

/**
 * Solve a quadratic equation of the form ax² + bx + c = 0.
 *
 * @param {string} lhs - The left-hand side.
 * @param {string} rhs - The right-hand side.
 * @param {string} variable - The variable name.
 * @param {string} category - The problem category.
 * @returns {object} The solution result.
 */
function solveQuadraticEquation(lhs, rhs, variable, category) {
  if (!variable) {
    return {
      answer: 'Could not solve',
      numericAnswer: null,
      steps: [],
      method: 'quadratic_formula',
      category,
      error: 'No variable found'
    }
  }

  // Move everything to one side: ax² + bx + c = 0
  const equation = `(${lhs}) - (${rhs})`
  const simplified = math.simplify(equation).toString()

  // Use the f(0)/f(1)/f(-1) trick to extract a, b, c.
  const f0 = math.evaluate(simplified, { [variable]: 0 })
  const f1 = math.evaluate(simplified, { [variable]: 1 })
  const fNeg1 = math.evaluate(simplified, { [variable]: -1 })
  const c = f0
  const a = (f1 + fNeg1) / 2 - c
  const b = f1 - a - c

  const steps = []
  steps.push({
    step: 1,
    description: 'Rearrange to standard form ax² + bx + c = 0',
    expression: simplified
  })
  steps.push({
    step: 2,
    description: `Identify coefficients: a=${roundResult(a)}, b=${roundResult(b)}, c=${roundResult(c)}`,
    expression: simplified
  })

  // Calculate discriminant: D = b² - 4ac
  const discriminant = b * b - 4 * a * c
  steps.push({
    step: 3,
    description: `Calculate discriminant: D = b² - 4ac = ${roundResult(discriminant)}`,
    expression: `D = ${roundResult(discriminant)}`
  })

  if (Math.abs(a) < TOLERANCE) {
    // Not actually quadratic — fall back to linear.
    return solveLinearEquation(lhs, rhs, variable, category)
  }

  if (discriminant > TOLERANCE) {
    // Two real roots.
    const sqrtD = Math.sqrt(discriminant)
    let root1 = (-b + sqrtD) / (2 * a)
    let root2 = (-b - sqrtD) / (2 * a)
    // Sort roots in ascending order for a consistent answer.
    if (root1 > root2) {
      const temp = root1
      root1 = root2
      root2 = temp
    }
    steps.push({
      step: 4,
      description: 'Apply quadratic formula: x = (-b ± √D) / 2a',
      expression: `x = (${roundResult(-b)} ± ${roundResult(sqrtD)}) / ${roundResult(2 * a)}`
    })
    steps.push({
      step: 5,
      description: 'Calculate the roots',
      expression: `x = ${roundResult(root1)} or x = ${roundResult(root2)}`
    })
    return {
      answer: `${variable} = ${roundResult(root1)} or ${variable} = ${roundResult(root2)}`,
      numericAnswer: [roundResult(root1), roundResult(root2)],
      steps,
      method: 'quadratic_formula',
      category
    }
  }

  if (Math.abs(discriminant) <= TOLERANCE) {
    // One repeated root.
    const root = -b / (2 * a)
    steps.push({
      step: 4,
      description: 'Apply quadratic formula: x = -b / 2a (repeated root)',
      expression: `x = ${roundResult(root)}`
    })
    return {
      answer: `${variable} = ${roundResult(root)}`,
      numericAnswer: [roundResult(root)],
      steps,
      method: 'quadratic_formula',
      category
    }
  }

  // No real roots.
  steps.push({
    step: 4,
    description: 'Discriminant is negative, no real solutions',
    expression: `D = ${roundResult(discriminant)} < 0`
  })
  return {
    answer: 'No real solutions',
    numericAnswer: null,
    steps,
    method: 'quadratic_formula',
    category
  }
}

/**
 * Solve a polynomial equation (degree > 2) by attempting to find rational
 * roots, falling back to a numeric root-finding approach.
 *
 * @param {string} lhs - The left-hand side.
 * @param {string} rhs - The right-hand side.
 * @param {string} variable - The variable name.
 * @param {string} category - The problem category.
 * @returns {object} The solution result.
 */
function solvePolynomialEquation(lhs, rhs, variable, category) {
  if (!variable) {
    return {
      answer: 'Could not solve',
      numericAnswer: null,
      steps: [],
      method: 'polynomial',
      category,
      error: 'No variable found'
    }
  }

  const equation = `(${lhs}) - (${rhs})`
  const simplified = math.simplify(equation).toString()

  // Try to factor the polynomial to find rational roots.
  try {
    const factored = math.factor(simplified)
    const roots = findRootsByFactoring(factored, variable)

    if (roots.length > 0) {
      const answer = roots.map((r) => `${variable} = ${roundResult(r)}`).join(' or ')
      return {
        answer,
        numericAnswer: roots.map(roundResult),
        steps: [
          { step: 1, description: 'Rearrange to standard form', expression: simplified },
          { step: 2, description: 'Factor the polynomial', expression: factored.toString() },
          { step: 3, description: 'Solve each factor for zero', expression: answer }
        ],
        method: 'polynomial_factoring',
        category
      }
    }
  } catch (error) {
    // Factoring failed — fall through to numeric approach.
  }

  // Numeric root-finding fallback.
  try {
    const roots = numericRoots(simplified, variable)
    if (roots.length > 0) {
      const answer = roots.map((r) => `${variable} = ${roundResult(r)}`).join(' or ')
      return {
        answer,
        numericAnswer: roots.map(roundResult),
        steps: [
          { step: 1, description: 'Rearrange to standard form', expression: simplified },
          { step: 2, description: 'Find roots numerically', expression: answer }
        ],
        method: 'polynomial_numeric',
        category
      }
    }
  } catch (error) {
    // Numeric approach failed too.
  }

  return {
    answer: 'Could not solve',
    numericAnswer: null,
    steps: [{ step: 1, description: 'Rearrange to standard form', expression: simplified }],
    method: 'polynomial',
    category,
    error: 'Unable to solve polynomial'
  }
}

/**
 * Simplify an expression without an equals sign.
 *
 * @param {string} expression - The expression to simplify.
 * @param {string} category - The problem category.
 * @returns {object} The solution result.
 */
function simplifyExpression(expression, category) {
  const simplified = math.simplify(expression).toString()
  return {
    answer: simplified,
    numericAnswer: null,
    steps: [
      { step: 1, description: 'Simplify the expression', expression: simplified }
    ],
    method: 'simplify',
    category
  }
}

/**
 * Solve a trigonometric expression or equation.
 *
 * @param {string} expression - The expression.
 * @param {string} category - The problem category.
 * @returns {object} The solution result.
 */
function solveTrigonometric(expression, category) {
  // If it's an equation, try to solve numerically; otherwise simplify.
  if (expression.includes('=')) {
    const { lhs, rhs } = splitEquation(expression)
    try {
      const equation = `(${lhs}) - (${rhs})`
      const simplified = math.simplify(equation).toString()
      return {
        answer: 'Trigonometric equation (solutions may be periodic)',
        numericAnswer: null,
        steps: [
          { step: 1, description: 'Rearrange the equation', expression: simplified }
        ],
        method: 'trigonometric',
        category
      }
    } catch (error) {
      return {
        answer: 'Could not solve',
        numericAnswer: null,
        steps: [],
        method: 'trigonometric',
        category,
        error: error.message
      }
    }
  }

  // Pure trigonometric expression — evaluate if numeric, else simplify.
  try {
    const simplified = math.simplify(expression).toString()
    return {
      answer: simplified,
      numericAnswer: null,
      steps: [
        { step: 1, description: 'Simplify the trigonometric expression', expression: simplified }
      ],
      method: 'trigonometric_simplify',
      category
    }
  } catch (error) {
    return {
      answer: 'Could not solve',
      numericAnswer: null,
      steps: [],
      method: 'trigonometric',
      category,
      error: error.message
    }
  }
}

/**
 * Return an unsupported result for calculus/matrix problems.
 *
 * @param {string} category - The problem category.
 * @returns {object} The unsupported result.
 */
function unsupportedResult(category) {
  return {
    answer: 'This problem type is not yet supported',
    numericAnswer: null,
    steps: [],
    method: 'unsupported',
    category
  }
}

/**
 * Find roots of a factored polynomial expression.
 *
 * @param {object} node - The factored Math.js node.
 * @param {string} variable - The variable name.
 * @returns {number[]} The roots found.
 */
function findRootsByFactoring(node, variable) {
  const roots = []
  const visit = (current) => {
    if (current.isOperatorNode && current.op === '*') {
      current.args.forEach(visit)
      return
    }
    // A factor of the form (x - r) or (x + r).
    if (current.isOperatorNode && (current.op === '+' || current.op === '-')) {
      const root = solveLinearFactor(current, variable)
      if (root !== null) roots.push(root)
      return
    }
    if (current.isSymbolNode && current.name === variable) {
      roots.push(0)
      return
    }
    if (current.isOperatorNode && current.op === '^') {
      const base = current.args[0]
      const exponent = current.args[1]
      const baseRoots = findRootsByFactoring(base, variable)
      const exp = exponent.isConstantNode ? Number(exponent.value) : 1
      for (let i = 0; i < exp; i += 1) {
        baseRoots.forEach((r) => roots.push(r))
      }
      return
    }
  }
  visit(node)
  return roots
}

/**
 * Solve a linear factor of the form (x - r) for its root.
 *
 * @param {object} node - The factor node.
 * @param {string} variable - The variable name.
 * @returns {number|null} The root, or null if not a linear factor.
 */
function solveLinearFactor(node, variable) {
  const args = node.args
  if (args.length !== 2) return null

  // Find the term containing the variable and the constant term.
  let coefficient = 0
  let constant = 0
  args.forEach((arg) => {
    if (arg.isSymbolNode && arg.name === variable) {
      coefficient += 1
    } else if (arg.isOperatorNode && arg.op === '*' && arg.args[0].isSymbolNode && arg.args[0].name === variable) {
      coefficient += Number(arg.args[1].value)
    } else if (arg.isConstantNode) {
      constant += Number(arg.value)
    }
  })

  if (Math.abs(coefficient) < TOLERANCE) return null
  // For (x - r): coefficient*x + constant = 0 -> x = -constant/coefficient
  return -constant / coefficient
}

/**
 * Find real roots of a polynomial numerically using a grid search with
 * refinement (bisection on sign changes).
 *
 * @param {string} expression - The polynomial expression.
 * @param {string} variable - The variable name.
 * @returns {number[]} The real roots found.
 */
function numericRoots(expression, variable) {
  const roots = []
  const f = (x) => math.evaluate(expression, { [variable]: x })

  // Scan a range for sign changes.
  const range = 100
  const step = 0.5
  let prevX = -range
  let prevY = f(prevX)

  for (let x = -range + step; x <= range; x += step) {
    const y = f(x)
    if (Number.isNaN(y) || !Number.isFinite(y)) {
      prevX = x
      prevY = y
      continue
    }
    if (prevY !== 0 && Math.sign(prevY) !== Math.sign(y)) {
      // Sign change between prevX and x — bisect to refine.
      const root = bisect(f, prevX, x)
      if (root !== null && !roots.some((r) => Math.abs(r - root) < TOLERANCE)) {
        roots.push(root)
      }
    } else if (Math.abs(y) < TOLERANCE) {
      if (!roots.some((r) => Math.abs(r - x) < TOLERANCE)) {
        roots.push(x)
      }
    }
    prevX = x
    prevY = y
  }

  return roots
}

/**
 * Refine a root using the bisection method.
 *
 * @param {Function} f - The function to find a root of.
 * @param {number} a - Left bracket.
 * @param {number} b - Right bracket.
 * @returns {number|null} The refined root, or null if bracketing fails.
 */
function bisect(f, a, b) {
  let lo = a
  let hi = b
  let fLo = f(lo)
  for (let i = 0; i < 100; i += 1) {
    const mid = (lo + hi) / 2
    const fMid = f(mid)
    if (Math.abs(fMid) < TOLERANCE) return mid
    if (Math.sign(fLo) === Math.sign(fMid)) {
      lo = mid
      fLo = fMid
    } else {
      hi = mid
    }
  }
  return (lo + hi) / 2
}

/**
 * Round a numeric result to a reasonable precision (10 decimal places max,
 * removing trailing zeros).
 *
 * @param {number} value - The value to round.
 * @returns {number} The rounded value.
 */
function roundResult(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return value
  const rounded = Math.round(value * 1e10) / 1e10
  return Object.is(rounded, -0) ? 0 : rounded
}

module.exports = {
  solveProblem,
  solveArithmetic,
  solveLinearEquation,
  solveQuadraticEquation,
  simplifyExpression,
  TOLERANCE
}

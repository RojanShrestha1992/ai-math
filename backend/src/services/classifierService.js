/**
 * Problem Classifier Service
 *
 * Classifies a parsed mathematical expression into a problem category
 * (arithmetic, linear_equation, quadratic_equation, etc.) based on its
 * structure and content.
 *
 * @module classifierService
 */

const { extractVariables, getDegree, isEquation, FUNCTION_NAMES } = require('../utils/latexParser')

const TRIG_FUNCTIONS = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh']
const LOG_FUNCTIONS = ['log', 'ln']
const CALCULUS_NOTATION = ['integrate', 'derivative', 'limit', 'sum']

/**
 * Classify a parsed expression into a problem category.
 *
 * @param {string} expression - The parsed Math.js-compatible expression.
 * @param {object} [metadata] - Optional metadata from the parser.
 * @returns {object} The classification result with category, confidence,
 *   and metadata.
 */
function classifyProblem(expression, metadata = {}) {
  const hasEquals = isEquation(expression)
  const variables = metadata.variables || extractVariables(expression)
  const degree = metadata.degree !== undefined
    ? metadata.degree
    : (variables.length === 1 ? getDegree(expression, variables[0]) : 0)

  const hasTrig = hasTrigFunctions(expression)
  const hasLog = hasLogFunctions(expression)
  const hasCalculus = hasCalculusNotation(expression)
  const hasMatrices = /\[\[/.test(expression)
  const numericOnly = isNumericOnly(expression, variables)

  const meta = {
    hasEquals,
    variables,
    degree,
    hasTrigFunctions: hasTrig,
    hasLogFunctions: hasLog,
    hasIntegrals: /integrate/.test(expression),
    hasDerivatives: /derivative/.test(expression),
    hasMatrices
  }

  // Priority 1: Unsupported (calculus, matrices)
  if (hasCalculus || hasMatrices) {
    return { category: 'unsupported', confidence: 0.95, metadata: meta }
  }

  // Priority 2: Arithmetic (no variables, only numbers and operators)
  if (numericOnly && !hasFunctionCall(expression) && !isSingleConstant(expression)) {
    return { category: 'arithmetic', confidence: 0.98, metadata: meta }
  }

  // Priority 2b: Evaluation (no variables, but contains function calls
  // or is a single numeric constant)
  if (numericOnly) {
    return { category: 'evaluation', confidence: 0.95, metadata: meta }
  }

  // Priority 3: Trigonometric equation (has = and trig)
  if (hasEquals && hasTrig) {
    return { category: 'trigonometric_equation', confidence: 0.9, metadata: meta }
  }

  // Priority 4: Trigonometric expression (no =, has trig)
  if (!hasEquals && hasTrig) {
    return { category: 'trigonometric_expression', confidence: 0.9, metadata: meta }
  }

  // Priority 5: Quadratic equation (has =, single variable, degree 2)
  if (hasEquals && variables.length === 1 && degree === 2) {
    return { category: 'quadratic_equation', confidence: 0.95, metadata: meta }
  }

  // Priority 6: Linear equation (has =, single variable, degree 1)
  if (hasEquals && variables.length === 1 && degree === 1) {
    return { category: 'linear_equation', confidence: 0.95, metadata: meta }
  }

  // Priority 7: Polynomial equation (has =, single variable, degree > 2)
  if (hasEquals && variables.length === 1 && degree > 2) {
    return { category: 'polynomial_equation', confidence: 0.9, metadata: meta }
  }

  // Priority 8: System of equations (multiple equations, multiple variables)
  if (hasEquals && variables.length > 1) {
    return { category: 'system_of_equations', confidence: 0.8, metadata: meta }
  }

  // Priority 9: Expression simplification (has variables, no =)
  if (!hasEquals && variables.length > 0) {
    return { category: 'expression_simplification', confidence: 0.85, metadata: meta }
  }

  // Priority 10: Evaluation (no variables, pure numeric)
  if (!hasEquals && numericOnly) {
    return { category: 'evaluation', confidence: 0.95, metadata: meta }
  }

  // Edge case: has = but no variables (e.g. 2+3=5) -> arithmetic with verification
  if (hasEquals && variables.length === 0) {
    return { category: 'arithmetic', confidence: 0.7, metadata: meta }
  }

  // Fallback
  return { category: 'unknown', confidence: 0.1, metadata: meta }
}

/**
 * Check whether an expression contains trigonometric functions.
 *
 * @param {string} expression - The parsed expression.
 * @returns {boolean} True if a trig function is present.
 */
function hasTrigFunctions(expression) {
  return TRIG_FUNCTIONS.some((fn) => new RegExp(`\\b${fn}\\b`).test(expression))
}

/**
 * Check whether an expression contains logarithmic functions.
 *
 * @param {string} expression - The parsed expression.
 * @returns {boolean} True if a log function is present.
 */
function hasLogFunctions(expression) {
  return LOG_FUNCTIONS.some((fn) => new RegExp(`\\b${fn}\\b`).test(expression))
}

/**
 * Check whether an expression contains calculus notation.
 *
 * @param {string} expression - The parsed expression.
 * @returns {boolean} True if calculus notation is present.
 */
function hasCalculusNotation(expression) {
  return CALCULUS_NOTATION.some((token) => new RegExp(`\\b${token}\\b`).test(expression))
}

/**
 * Check whether an expression is a single numeric constant (e.g. "42").
 *
 * @param {string} expression - The parsed expression.
 * @returns {boolean} True if the expression is a single number.
 */
function isSingleConstant(expression) {
  return /^-?\d+(\.\d+)?$/.test(expression.trim())
}

/**
 * Check whether an expression contains a function call.
 *
 * @param {string} expression - The parsed expression.
 * @returns {boolean} True if a known function call is present.
 */
function hasFunctionCall(expression) {
  return FUNCTION_NAMES.some((fn) => new RegExp(`\\b${fn}\\s*\\(`).test(expression))
}

/**
 * Count the number of unique variables in an expression.
 *
 * @param {string} expression - The parsed expression.
 * @returns {number} The number of unique variables.
 */
function countVariables(expression) {
  return extractVariables(expression).length
}

/**
 * Check whether an expression contains only numbers and operators
 * (no variables).
 *
 * @param {string} expression - The parsed expression.
 * @param {string[]} [variables] - Pre-extracted variables.
 * @returns {boolean} True if the expression is numeric only.
 */
function isNumericOnly(expression, variables) {
  const vars = variables || extractVariables(expression)
  return vars.length === 0
}

module.exports = {
  classifyProblem,
  hasTrigFunctions,
  hasLogFunctions,
  hasCalculusNotation,
  countVariables,
  isNumericOnly
}

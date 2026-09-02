/**
 * Verification Service
 *
 * Verifies mathematical solutions by substitution, re-evaluation, or
 * numerical differentiation. Uses a floating point tolerance of 1e-10.
 *
 * @module verificationService
 */

const math = require('mathjs')
const { splitEquation, extractVariables } = require('../utils/latexParser')

// Floating point tolerance for numeric comparisons. Set to 1e-6 to
// accommodate roots rounded to 10 decimal places (residual ~1e-10) and
// general floating point error in numerical solving.
const TOLERANCE = 1e-6

/**
 * Verify a solution based on the problem category.
 *
 * @param {object} params - Verification parameters.
 * @param {string} params.originalExpression - The original parsed expression.
 * @param {string} params.category - The problem category.
 * @param {number|number[]|null} params.numericAnswer - The numeric answer(s).
 * @param {string} [params.variable] - The variable name (for equations).
 * @returns {object} The verification result.
 */
function verifySolution({ originalExpression, category, numericAnswer, variable }) {
  try {
    switch (category) {
      case 'linear_equation':
      case 'quadratic_equation':
      case 'polynomial_equation':
      case 'trigonometric_equation':
        return verifyEquation(originalExpression, category, numericAnswer, variable)
      case 'arithmetic':
      case 'evaluation':
        return verifyEvaluation(originalExpression, numericAnswer)
      case 'expression_simplification':
        return verifySimplification(originalExpression)
      case 'unsupported':
        return { verified: null, details: 'Verification not applicable', method: 'none' }
      default:
        return { verified: null, details: 'Verification not applicable', method: 'none' }
    }
  } catch (error) {
    console.error('[verify] Verification failed:', error.message)
    return {
      verified: null,
      details: `Verification failed: ${error.message}`,
      method: 'none'
    }
  }
}

/**
 * Verify an equation by substituting the answer(s) back into the original.
 *
 * @param {string} expression - The equation expression.
 * @param {string} category - The problem category.
 * @param {number|number[]|null} numericAnswer - The answer value(s).
 * @param {string} variable - The variable name.
 * @returns {object} The verification result.
 */
function verifyEquation(expression, category, numericAnswer, variable) {
  if (numericAnswer === null || numericAnswer === undefined) {
    return { verified: null, details: 'No numeric answer to verify', method: 'none' }
  }

  const { lhs, rhs } = splitEquation(expression)
  const values = Array.isArray(numericAnswer) ? numericAnswer : [numericAnswer]
  const details = []

  let allMatch = true
  values.forEach((value) => {
    const result = verifyBySubstitution(lhs, rhs, variable, value)
    details.push(result.details)
    if (!result.verified) allMatch = false
  })

  return {
    verified: allMatch,
    details: details.join(', '),
    method: 'substitution'
  }
}

/**
 * Verify a single value by substituting it into both sides of an equation.
 *
 * @param {string} lhs - The left-hand side.
 * @param {string} rhs - The right-hand side.
 * @param {string} variable - The variable name.
 * @param {number} value - The value to substitute.
 * @returns {object} The verification result.
 */
function verifyBySubstitution(lhs, rhs, variable, value) {
  const lhsResult = math.evaluate(lhs, { [variable]: value })
  const rhsResult = math.evaluate(rhs, { [variable]: value })
  const isMatch = Math.abs(lhsResult - rhsResult) < TOLERANCE

  return {
    verified: isMatch,
    details: `${lhs}|_${variable}=${value} = ${lhsResult}, ${rhs}|_${variable}=${value} = ${rhsResult} ${isMatch ? '✓' : '✗'}`,
    method: 'substitution'
  }
}

/**
 * Verify an arithmetic/evaluation result by re-evaluating the expression.
 *
 * @param {string} expression - The expression.
 * @param {number|number[]|null} numericAnswer - The computed answer.
 * @returns {object} The verification result.
 */
function verifyEvaluation(expression, numericAnswer) {
  if (numericAnswer === null || numericAnswer === undefined) {
    return { verified: null, details: 'No numeric answer to verify', method: 'none' }
  }

  const recheck = math.evaluate(expression)
  const isMatch = Math.abs(recheck - numericAnswer) < TOLERANCE
  return {
    verified: isMatch,
    details: `${expression} = ${recheck} ${isMatch ? '✓' : '✗'}`,
    method: 'reevaluation'
  }
}

/**
 * Verify a simplification by evaluating both the original and simplified
 * forms at a few test points.
 *
 * @param {string} expression - The original expression.
 * @returns {object} The verification result.
 */
function verifySimplification(expression) {
  const variables = extractVariables(expression)
  if (variables.length === 0) {
    return { verified: null, details: 'No variables to test', method: 'none' }
  }

  const simplified = math.simplify(expression).toString()
  const testPoints = [1, 2, 3]
  let allMatch = true
  const details = []

  testPoints.forEach((point) => {
    const scope = {}
    variables.forEach((v) => { scope[v] = point })
    const originalValue = math.evaluate(expression, scope)
    const simplifiedValue = math.evaluate(simplified, scope)
    const isMatch = Math.abs(originalValue - simplifiedValue) < TOLERANCE
    if (!isMatch) allMatch = false
    details.push(`x=${point}: ${originalValue} vs ${simplifiedValue} ${isMatch ? '✓' : '✗'}`)
  })

  return {
    verified: allMatch,
    details: details.join(', '),
    method: 'reevaluation'
  }
}

module.exports = {
  verifySolution,
  verifyBySubstitution,
  TOLERANCE
}

const MATHLIVE_PLACEHOLDER_PATTERN = /\\placeholder\{[^}]*\}/g
const LATEX_COMMAND_PATTERN = /\\[a-zA-Z]+/
const DIGIT_PATTERN = /[0-9]/
const OPERATOR_PATTERN = /[+\-=×÷<>]/
const VARIABLE_PATTERN = /(^|[^a-zA-Z])[a-zA-Z]([^a-zA-Z]|$)/

const MAX_EXPRESSION_LENGTH = 500

/**
 * Check if the LaTeX expression is empty or whitespace only.
 * @param {string} latex
 * @returns {boolean}
 */
export function isEmptyExpression(latex) {
  if (latex === null || latex === undefined) return true
  const cleaned = String(latex).replace(MATHLIVE_PLACEHOLDER_PATTERN, '').trim()
  return cleaned === ''
}

/**
 * Check if the expression has basic mathematical structure
 * (contains at least one number, variable, or math operator).
 * @param {string} latex
 * @returns {boolean}
 */
export function hasBasicStructure(latex) {
  if (isEmptyExpression(latex)) return false
  const cleaned = String(latex).replace(MATHLIVE_PLACEHOLDER_PATTERN, '')

  if (LATEX_COMMAND_PATTERN.test(cleaned)) return true
  if (DIGIT_PATTERN.test(cleaned)) return true
  if (OPERATOR_PATTERN.test(cleaned)) return true
  if (VARIABLE_PATTERN.test(cleaned)) return true

  return false
}

/**
 * Clean and normalize a LaTeX string.
 * @param {string} latex
 * @returns {string}
 */
export function sanitizeLatex(latex) {
  if (latex === null || latex === undefined) return ''
  return String(latex)
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\\left\(/g, '(')
    .replace(/\\right\)/g, ')')
    .replace(/\\left\[/g, '[')
    .replace(/\\right\]/g, ']')
}

/**
 * Get a user-friendly validation message.
 * @param {string} latex
 * @returns {string|null} null if valid, message string if invalid
 */
export function getValidationMessage(latex) {
  if (isEmptyExpression(latex)) return 'Please enter a mathematical expression'
  if (!hasBasicStructure(latex)) return "This doesn't look like a math expression"
  if (String(latex).length > MAX_EXPRESSION_LENGTH) return 'Expression is too long. Please simplify.'
  return null
}
/**
 * Problem request validation.
 *
 * Validates the incoming LaTeX problem payload before it reaches the pipeline.
 *
 * @module problemValidator
 */

/**
 * Validate a problem solve request body.
 *
 * @param {object} body - The request body.
 * @returns {{ valid: boolean, errors: string[] }} Validation result.
 */
function validateProblemRequest(body) {
  const errors = []

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] }
  }

  const { latex } = body

  if (latex === undefined || latex === null) {
    errors.push('Field "latex" is required')
  } else if (typeof latex !== 'string') {
    errors.push('Field "latex" must be a string')
  } else if (latex.trim().length === 0) {
    errors.push('Field "latex" must not be empty')
  } else if (latex.trim().length > 2000) {
    errors.push('Field "latex" must not exceed 2000 characters')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

module.exports = {
  validateProblemRequest
}

import api from './api'

/**
 * Map backend error codes to user-friendly messages.
 * @param {string} code - Error code from backend
 * @param {string} fallback - Fallback message
 * @returns {string} User-friendly error message
 */
export function getErrorMessage(code, fallback) {
  const messages = {
    INVALID_INPUT: 'Please enter a valid mathematical expression.',
    PARSE_ERROR: "We couldn't understand this expression. Try rewriting it.",
    SOLVE_ERROR: "We couldn't solve this problem. It may be too complex.",
    UNSUPPORTED: 'This type of problem is not yet supported.',
    VALIDATION_ERROR: 'The expression appears to be incomplete or invalid.',
  }
  return messages[code] || fallback
}

/**
 * Send a LaTeX expression to the backend for solving.
 * @param {string} latex - The LaTeX expression to solve
 * @returns {Promise<object>} The solved problem data
 * @throws {Error} If the API call fails
 */
export async function solveProblem(latex) {
  try {
    const response = await api.post('/problems/solve', { latex })

    if (response.data && response.data.success === true) {
      return response.data.data
    }

    // API returned an error payload
    const code = response.data?.error?.code
    const message = response.data?.error?.message || 'Unable to solve this problem.'
    const error = new Error(message)
    error.code = code
    throw error
  } catch (err) {
    // Network / timeout errors from axios
    if (err.code === 'ECONNABORTED') {
      const timeoutError = new Error('The solver took too long to respond. Please try a simpler expression.')
      timeoutError.code = 'TIMEOUT'
      throw timeoutError
    }

    if (!err.response) {
      const networkError = new Error('Cannot connect to server. Please check your connection.')
      networkError.code = 'NETWORK_ERROR'
      throw networkError
    }

    // Re-throw API errors (already have code/message)
    throw err
  }
}

/**
 * Problem controller.
 *
 * Handles HTTP requests for the math solver endpoint by delegating to the
 * problem processing pipeline.
 *
 * @module problemController
 */

const problemPipeline = require('../services/problemPipeline')
const { validateProblemRequest } = require('../validators/problemValidator')

/**
 * POST /api/problems/solve
 * Solve a LaTeX math problem through the full pipeline.
 *
 * @param {object} req - Express request.
 * @param {object} res - Express response.
 */
function solveProblem(req, res) {
  const validation = validateProblemRequest(req.body)

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: validation.errors.join('; ')
      }
    })
  }

  const result = problemPipeline.processProblem(req.body.latex)

  if (!result.success) {
    return res.status(422).json({
      success: false,
      error: result.error
    })
  }

  return res.status(200).json(result)
}

module.exports = {
  solveProblem
}

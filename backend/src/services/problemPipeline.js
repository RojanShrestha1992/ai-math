/**
 * Problem Processing Pipeline
 *
 * Orchestrates the full mathematical processing flow:
 * Parse -> Classify -> Solve -> Verify -> Assemble.
 * This is the single entry point called by the API controller.
 *
 * @module problemPipeline
 */

const latexParser = require('../utils/latexParser')
const classifierService = require('./classifierService')
const solverService = require('./solverService')
const verificationService = require('./verificationService')

/**
 * Process a LaTeX math problem through the full pipeline.
 *
 * @param {string} latex - The raw LaTeX input.
 * @returns {object} The complete result with success flag.
 */
function processProblem(latex) {
  const startTime = Date.now()
  console.log(`[INFO] Pipeline started for: "${latex}"`)

  // Stage 1: PARSE
  let parsedExpression
  try {
    const parseStart = Date.now()
    parsedExpression = latexParser.latexToExpression(latex)
    console.log(`[INFO] Stage 1 (Parse): "${parsedExpression}" [${Date.now() - parseStart}ms]`)
  } catch (error) {
    console.error(`[INFO] Stage 1 (Parse) failed: ${error.message}`)
    return {
      success: false,
      error: {
        code: 'PARSE_ERROR',
        message: error.message,
        stage: 'parse'
      }
    }
  }

  // Stage 2: CLASSIFY
  let classification
  try {
    const classifyStart = Date.now()
    classification = classifierService.classifyProblem(parsedExpression)
    console.log(`[INFO] Stage 2 (Classify): ${classification.category} [${Date.now() - classifyStart}ms]`)
  } catch (error) {
    console.error(`[INFO] Stage 2 (Classify) failed, defaulting to unknown: ${error.message}`)
    classification = { category: 'unknown', confidence: 0, metadata: {} }
  }

  // Stage 3: SOLVE
  let solution
  try {
    const solveStart = Date.now()
    solution = solverService.solveProblem(
      parsedExpression,
      classification.category,
      classification.metadata
    )
    console.log(`[INFO] Stage 3 (Solve): ${solution.answer} [${Date.now() - solveStart}ms]`)
  } catch (error) {
    console.error(`[INFO] Stage 3 (Solve) failed: ${error.message}`)
    solution = {
      answer: 'Could not solve',
      numericAnswer: null,
      steps: [],
      method: 'error',
      category: classification.category,
      error: error.message
    }
  }

  // Stage 4: VERIFY
  let verification
  try {
    const verifyStart = Date.now()
    const variable = classification.metadata.variables
      ? classification.metadata.variables[0]
      : undefined
    verification = verificationService.verifySolution({
      originalExpression: parsedExpression,
      category: classification.category,
      numericAnswer: solution.numericAnswer,
      variable
    })
    console.log(`[INFO] Stage 4 (Verify): ${verification.verified === true ? 'verified ✓' : verification.verified === false ? 'failed ✗' : 'n/a'} [${Date.now() - verifyStart}ms]`)
  } catch (error) {
    console.error(`[INFO] Stage 4 (Verify) failed: ${error.message}`)
    verification = { verified: null, details: 'Verification failed', method: 'none' }
  }

  // Stage 5: ASSEMBLE
  const result = {
    success: true,
    data: {
      originalLatex: latex,
      parsedExpression,
      category: classification.category,
      categoryConfidence: classification.confidence,
      solution,
      verification
    }
  }

  console.log(`[INFO] Pipeline complete [${Date.now() - startTime}ms]`)
  return result
}

module.exports = {
  processProblem
}

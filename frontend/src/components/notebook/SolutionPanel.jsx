import { MdLightbulb } from 'react-icons/md'
import useNotebookStore from '../../store/useNotebookStore'
import StepCard from './StepCard'
import VerificationBadge from './VerificationBadge'
import SolutionSkeleton from './SolutionSkeleton'
import ErrorMessage from '../ui/ErrorMessage'

// Map backend category codes to friendly display names
const CATEGORY_LABELS = {
  arithmetic: '🔢 Arithmetic',
  evaluation: '🔢 Evaluation',
  linear_equation: '📐 Linear Equation',
  quadratic_equation: '📐 Quadratic Equation',
  polynomial_equation: '📐 Polynomial Equation',
  expression_simplification: '✏️ Simplification',
  trigonometric_expression: '📐 Trigonometry',
  trigonometric_equation: '📐 Trigonometric Equation',
  derivative: '📈 Derivative',
  unknown: '❓ Unknown Type',
}

// Color-code category badges by type
const CATEGORY_COLORS = {
  arithmetic: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  evaluation: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  linear_equation: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  quadratic_equation: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  polynomial_equation: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  expression_simplification: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
  trigonometric_expression: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  trigonometric_equation: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  derivative: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
  unknown: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
}

function getCategoryLabel(category) {
  return CATEGORY_LABELS[category] || CATEGORY_LABELS.unknown
}

function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.unknown
}

function SolutionPanel({ onRetry }) {
  const solution = useNotebookStore((state) => state.solution)
  const isLoading = useNotebookStore((state) => state.isLoading)
  const error = useNotebookStore((state) => state.error)
  const setError = useNotebookStore((state) => state.setError)

  // State B: Loading
  if (isLoading) {
    return <SolutionSkeleton />
  }

  // State C: Error
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <ErrorMessage message={error} onRetry={onRetry || (() => setError(null))} />
      </div>
    )
  }

  // State A: Empty (no solution yet)
  if (!solution) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-8">
          <MdLightbulb className="text-4xl text-gray-300 dark:text-gray-600 mx-auto" aria-hidden="true" />
          <p className="text-gray-500 dark:text-gray-400 mt-3">
            Enter a math problem above and click Solve to see the step-by-step solution here.
          </p>
        </div>
      </div>
    )
  }

  // State D: Solution exists
  const category = solution.category
  const steps = solution.solution?.steps || []
  const answer = solution.solution?.answer || ''
  const verification = solution.verification

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
      {/* Section 1: Category badge */}
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(category)}`}>
          {getCategoryLabel(category)}
        </span>
      </div>

      {/* Section 2: Solution steps */}
      <div>
        <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">Solution Steps</h4>
        {steps.length > 0 ? (
          <div className="space-y-3">
            {steps.map((step, index) => (
              <StepCard
                key={step.step ?? index}
                stepNumber={step.step ?? index + 1}
                description={step.description}
                expression={step.expression}
                index={index}
              />
            ))}
          </div>
        ) : (
          <StepCard stepNumber={1} description="Evaluated the expression" expression={answer} index={0} />
        )}
      </div>

      {/* Section 3: Final answer */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Final Answer</h4>
        <div
          className={`rounded-lg p-4 text-center ${
            verification?.verified === true
              ? 'bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800'
              : 'bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-800'
          }`}
        >
          <span className="text-2xl font-bold font-mono text-gray-900 dark:text-gray-50">
            {answer}
          </span>
        </div>
      </div>

      {/* Section 4: Verification status */}
      {verification && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Verification</h4>
          <VerificationBadge verified={verification.verified} details={verification.details} />
        </div>
      )}

      {/* Section 5: AI explanation placeholder */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">💬 Detailed Explanation</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          AI-powered step-by-step explanation will be available soon.
        </p>
      </div>
    </div>
  )
}

export default SolutionPanel
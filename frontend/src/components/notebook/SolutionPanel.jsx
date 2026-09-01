import { MdCheckCircle, MdWarning, MdLightbulb, MdCategory } from 'react-icons/md'
import useNotebookStore from '../../store/useNotebookStore'
import StepCard from './StepCard'

// Temporary mock data for UI testing — remove in Phase 4
const mockSolution = {
  category: 'Linear Equation',
  steps: [
    { step: 1, description: 'Subtract 5 from both sides', expression: '2x = 10' },
    { step: 2, description: 'Divide both sides by 2', expression: 'x = 5' },
  ],
  finalAnswer: 'x = 5',
  verified: true,
  explanation: 'We isolate x by performing inverse operations on both sides of the equation.',
}

function SolutionPanel() {
  const solution = useNotebookStore((state) => state.solution)
  const setSolution = useNotebookStore((state) => state.setSolution)

  const showMock = solution === null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {showMock ? (
        <div className="text-center py-8">
          <MdLightbulb className="text-4xl text-gray-300 dark:text-gray-600 mx-auto" aria-hidden="true" />
          <p className="text-gray-500 dark:text-gray-400 mt-3">
            Enter a math problem above and click Solve to see the step-by-step solution here.
          </p>
          <button
            type="button"
            onClick={() => setSolution(mockSolution)}
            className="mt-4 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Show Mock Solution
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <MdCategory className="text-xl text-indigo-500 dark:text-indigo-400" aria-hidden="true" />
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">
              Category: {solution.category}
            </h3>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">Solution Steps</h4>
            <div className="space-y-3">
              {solution.steps.map((step) => (
                <StepCard
                  key={step.step}
                  stepNumber={step.step}
                  description={step.description}
                  expression={step.expression}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-gray-200 dark:border-gray-700 pt-4">
            {solution.verified ? (
              <MdCheckCircle className="text-2xl text-green-500" aria-hidden="true" />
            ) : (
              <MdWarning className="text-2xl text-yellow-500" aria-hidden="true" />
            )}
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Final Answer: {solution.finalAnswer}
            </p>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">💬 Explanation</h4>
            <p className="text-gray-600 dark:text-gray-300">{solution.explanation}</p>
          </div>

          <button
            type="button"
            onClick={() => setSolution(null)}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Clear Solution
          </button>
        </div>
      )}
    </div>
  )
}

export default SolutionPanel
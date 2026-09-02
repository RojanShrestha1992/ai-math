import { TbSparkles } from 'react-icons/tb'
import useNotebookStore from '../../store/useNotebookStore'
import { getValidationMessage, isEmptyExpression } from '../../utils/mathValidation'

function SolveButton() {
  const currentExpression = useNotebookStore((state) => state.currentExpression)
  const isLoading = useNotebookStore((state) => state.isLoading)

  const isEmpty = isEmptyExpression(currentExpression)
  const validationMessage = getValidationMessage(currentExpression)
  const isValid = validationMessage === null

  let className = 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-50'
  if (isLoading) {
    className = 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white cursor-wait opacity-70'
  } else if (isValid && !isEmpty) {
    className = 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white cursor-pointer hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] shadow-lg'
  } else if (!isEmpty) {
    className = 'bg-yellow-200 dark:bg-yellow-900/60 text-yellow-800 dark:text-yellow-200 cursor-not-allowed'
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        aria-label="Solve math problem"
        aria-busy={isLoading}
        disabled={!isValid || isLoading}
        className={`w-full sm:w-64 h-14 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${className}`}
      >
        {isLoading ? (
          <>
            <span
              className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"
              aria-hidden="true"
            />
            Solving...
          </>
        ) : (
          <>
            <TbSparkles className="text-xl" aria-hidden="true" />
            Solve
          </>
        )}
      </button>
      {!isEmpty && !isValid && (
        <p className="text-sm text-yellow-700 dark:text-yellow-300" role="alert">
          {validationMessage}
        </p>
      )}
    </div>
  )
}

export default SolveButton
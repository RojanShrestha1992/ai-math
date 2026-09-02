import { useEffect, useRef } from 'react'
import { renderMathInElement } from 'mathlive'
import 'mathlive/static.css'
import useNotebookStore from '../../store/useNotebookStore'

/**
 * Live preview of the typed expression, rendered as static math.
 * Only visible when the current expression is non-empty.
 */
function ExpressionPreview() {
  const currentExpression = useNotebookStore((state) => state.currentExpression)
  const containerRef = useRef(null)

  const trimmed = currentExpression.trim()

  useEffect(() => {
    if (containerRef.current && trimmed) {
      renderMathInElement(containerRef.current)
    }
  }, [trimmed])

  if (!trimmed) return null

  return (
    <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 rounded-xl p-4 animate-fade-in">
      <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-2">📝 You entered:</p>
      <div
        ref={containerRef}
        className="math-preview text-gray-800 dark:text-gray-100 overflow-x-auto py-1"
        aria-label="Expression preview"
      >
        {`\\(${trimmed}\\)`}
      </div>
    </div>
  )
}

export default ExpressionPreview
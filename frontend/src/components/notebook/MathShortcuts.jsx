import { useState } from 'react'
import { MdExpandMore, MdExpandLess } from 'react-icons/md'
import useNotebookStore from '../../store/useNotebookStore'

const CATEGORIES = [
  {
    id: 'basic',
    label: 'Basic',
    items: [
      { symbol: '½', latex: '\\frac{}{}', tooltip: '\\frac{}{}' },
      { symbol: '√', latex: '\\sqrt{}', tooltip: '\\sqrt{}' },
      { symbol: '∛', latex: '\\sqrt[]{}', tooltip: '\\sqrt[]{}' },
      { symbol: 'xⁿ', latex: '^{}', tooltip: '^{}' },
      { symbol: 'xₙ', latex: '_{}', tooltip: '_{}' },
    ],
  },
  {
    id: 'greek',
    label: 'Greek & Constants',
    items: [
      { symbol: 'π', latex: '\\pi', tooltip: '\\pi' },
      { symbol: 'θ', latex: '\\theta', tooltip: '\\theta' },
      { symbol: 'α', latex: '\\alpha', tooltip: '\\alpha' },
      { symbol: 'β', latex: '\\beta', tooltip: '\\beta' },
      { symbol: '∞', latex: '\\infty', tooltip: '\\infty' },
      { symbol: 'e', latex: 'e', tooltip: 'e' },
    ],
  },
  {
    id: 'operators',
    label: 'Operators',
    items: [
      { symbol: '±', latex: '\\pm', tooltip: '\\pm' },
      { symbol: '≠', latex: '\\neq', tooltip: '\\neq' },
      { symbol: '≤', latex: '\\leq', tooltip: '\\leq' },
      { symbol: '≥', latex: '\\geq', tooltip: '\\geq' },
      { symbol: '×', latex: '\\times', tooltip: '\\times' },
      { symbol: '÷', latex: '\\div', tooltip: '\\div' },
    ],
  },
  {
    id: 'functions',
    label: 'Functions',
    items: [
      { symbol: 'sin', latex: '\\sin', tooltip: '\\sin' },
      { symbol: 'cos', latex: '\\cos', tooltip: '\\cos' },
      { symbol: 'tan', latex: '\\tan', tooltip: '\\tan' },
      { symbol: 'log', latex: '\\log', tooltip: '\\log' },
      { symbol: 'ln', latex: '\\ln', tooltip: '\\ln' },
      { symbol: 'lim', latex: '\\lim_{}', tooltip: '\\lim_{}' },
    ],
  },
  {
    id: 'calculus',
    label: 'Calculus',
    items: [
      { symbol: '∫', latex: '\\int', tooltip: '\\int' },
      { symbol: '∑', latex: '\\sum', tooltip: '\\sum' },
      { symbol: '∏', latex: '\\prod', tooltip: '\\prod' },
      { symbol: 'd/dx', latex: '\\frac{d}{dx}', tooltip: '\\frac{d}{dx}' },
    ],
  },
]

function MathShortcuts() {
  const inputMode = useNotebookStore((state) => state.inputMode)
  const setShortcutInsert = useNotebookStore((state) => state.setShortcutInsert)
  const [expanded, setExpanded] = useState(false)

  if (inputMode !== 'type') return null

  const handleInsert = (latex) => {
    setShortcutInsert(latex)
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
      >
        <span>📐 Math Symbols</span>
        {expanded ? (
          <MdExpandLess className="text-xl" aria-hidden="true" />
        ) : (
          <MdExpandMore className="text-xl" aria-hidden="true" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 animate-fade-in">
          {CATEGORIES.map((category) => (
            <div key={category.id}>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">{category.label}</p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {category.items.map((item) => (
                  <button
                    key={item.latex}
                    type="button"
                    title={item.tooltip}
                    aria-label={`Insert ${item.tooltip}`}
                    onClick={() => handleInsert(item.latex)}
                    className="h-10 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 text-sm hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                  >
                    {item.symbol}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MathShortcuts
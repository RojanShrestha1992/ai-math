import { useState } from 'react'
import { MdUndo, MdRedo, MdDeleteOutline, MdBorderClear, MdContentCopy, MdCheck } from 'react-icons/md'
import useNotebookStore from '../../store/useNotebookStore'

function Toolbar() {
  const inputMode = useNotebookStore((state) => state.inputMode)
  const currentExpression = useNotebookStore((state) => state.currentExpression)
  const canUndo = useNotebookStore((state) => state.canUndo)
  const canRedo = useNotebookStore((state) => state.canRedo)
  const setToolbarAction = useNotebookStore((state) => state.setToolbarAction)
  const resetProblem = useNotebookStore((state) => state.resetProblem)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!currentExpression.trim()) return
    try {
      await navigator.clipboard.writeText(currentExpression)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard unavailable — ignore silently
    }
  }

  const handleClear = () => {
    // Reset all store state and clear the math field
    resetProblem()
    setToolbarAction('clear')
  }

  const buttons = [
    {
      id: 'undo',
      label: 'Undo',
      icon: MdUndo,
      ariaLabel: 'Undo',
      disabled: !canUndo,
      onClick: () => setToolbarAction('undo'),
    },
    {
      id: 'redo',
      label: 'Redo',
      icon: MdRedo,
      ariaLabel: 'Redo',
      disabled: !canRedo,
      onClick: () => setToolbarAction('redo'),
    },
    {
      id: 'clear',
      label: 'Clear',
      icon: MdDeleteOutline,
      ariaLabel: 'Clear',
      disabled: false,
      onClick: handleClear,
    },
    {
      id: 'eraser',
      label: 'Eraser',
      icon: MdBorderClear,
      ariaLabel: 'Eraser',
      visible: inputMode === 'write',
    },
    {
      id: 'copy',
      label: 'Copy LaTeX',
      icon: copied ? MdCheck : MdContentCopy,
      ariaLabel: copied ? 'LaTeX copied' : 'Copy LaTeX',
      disabled: !currentExpression.trim(),
      onClick: handleCopy,
    },
  ]

  return (
    <div className="flex items-center gap-1.5 flex-wrap" role="toolbar" aria-label="Notebook toolbar">
      {buttons
        .filter((button) => button.visible !== false)
        .map(({ id, label, icon: Icon, ariaLabel, disabled, onClick }) => (
          <button
            key={id}
            type="button"
            aria-label={ariaLabel}
            title={label}
            disabled={disabled}
            onClick={onClick}
            className={`flex flex-col items-center justify-center w-11 h-11 rounded-lg transition-colors ${
              disabled
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600'
            }`}
          >
            <Icon className="text-xl" aria-hidden="true" />
            <span className="hidden md:inline text-[10px] leading-none mt-0.5">{label}</span>
          </button>
        ))}
    </div>
  )
}

export default Toolbar
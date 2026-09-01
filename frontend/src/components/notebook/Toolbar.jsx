import { MdUndo, MdRedo, MdDeleteOutline, MdBorderClear, MdContentCopy } from 'react-icons/md'
import useNotebookStore from '../../store/useNotebookStore'

function Toolbar() {
  const inputMode = useNotebookStore((state) => state.inputMode)

  const buttons = [
    { id: 'undo', label: 'Undo', icon: MdUndo, ariaLabel: 'Undo' },
    { id: 'redo', label: 'Redo', icon: MdRedo, ariaLabel: 'Redo' },
    { id: 'clear', label: 'Clear', icon: MdDeleteOutline, ariaLabel: 'Clear' },
    {
      id: 'eraser',
      label: 'Eraser',
      icon: MdBorderClear,
      ariaLabel: 'Eraser',
      visible: inputMode === 'write',
    },
    { id: 'copy', label: 'Copy LaTeX', icon: MdContentCopy, ariaLabel: 'Copy LaTeX' },
  ]

  return (
    <div className="flex items-center gap-1.5 flex-wrap" role="toolbar" aria-label="Notebook toolbar">
      {buttons
        .filter((button) => button.visible !== false)
        .map(({ id, label, icon: Icon, ariaLabel }) => (
          <button
            key={id}
            type="button"
            aria-label={ariaLabel}
            title={label}
            className="flex flex-col items-center justify-center w-11 h-11 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors"
          >
            <Icon className="text-xl" aria-hidden="true" />
            <span className="hidden md:inline text-[10px] leading-none mt-0.5">{label}</span>
          </button>
        ))}
    </div>
  )
}

export default Toolbar
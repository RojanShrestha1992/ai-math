import { MdEdit, MdKeyboard, MdImage } from 'react-icons/md'
import useNotebookStore from '../../store/useNotebookStore'

const MODES = [
  { id: 'write', label: 'Write', icon: MdEdit },
  { id: 'type', label: 'Type', icon: MdKeyboard },
  { id: 'image', label: 'Upload', icon: MdImage },
]

function InputModeSwitcher() {
  const inputMode = useNotebookStore((state) => state.inputMode)
  const setInputMode = useNotebookStore((state) => state.setInputMode)

  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Choose input method</p>
      <div
        role="tablist"
        aria-label="Choose input method"
        className="inline-flex rounded-full bg-gray-100 dark:bg-gray-800 p-1 gap-1"
      >
        {MODES.map(({ id, label, icon: Icon }) => {
          const isActive = inputMode === id
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setInputMode(id)}
              className={[
                'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300',
                isActive
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700',
              ].join(' ')}
            >
              <Icon className="text-lg" aria-hidden="true" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default InputModeSwitcher

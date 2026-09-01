import { Link } from 'react-router-dom'
import { PiMathOperationsBold } from 'react-icons/pi'
import { MdHistory, MdLightMode, MdDarkMode } from 'react-icons/md'
import useNotebookStore from '../../store/useNotebookStore'

function Header() {
  const theme = useNotebookStore((state) => state.theme)
  const toggleTheme = useNotebookStore((state) => state.toggleTheme)

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="container mx-auto max-w-4xl px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" aria-label="AI Math Notebook home">
          <PiMathOperationsBold className="text-2xl text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
          <span className="font-bold text-xl text-gray-800 dark:text-gray-100">
            AI Math Notebook
          </span>
        </Link>

        <nav className="flex items-center gap-2" aria-label="Main navigation">
          <Link
            to="/history"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="History"
          >
            <MdHistory className="text-xl" aria-hidden="true" />
            <span className="hidden sm:inline text-sm font-medium">History</span>
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? (
              <MdLightMode className="text-xl" aria-hidden="true" />
            ) : (
              <MdDarkMode className="text-xl" aria-hidden="true" />
            )}
          </button>
        </nav>
      </div>
    </header>
  )
}

export default Header

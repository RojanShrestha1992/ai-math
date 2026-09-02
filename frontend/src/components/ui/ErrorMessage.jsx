/**
 * Reusable error/warning/info display card.
 * @param {string} message - The message to display
 * @param {Function} [onRetry] - Optional callback for the "Try Again" button
 * @param {string} [type] - 'error' | 'warning' | 'info'
 */
function ErrorMessage({ message, onRetry, type = 'error' }) {
  const styles = {
    error: {
      container: 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800',
      accent: 'border-l-red-500 dark:border-l-red-600',
      icon: 'text-red-500 dark:text-red-400',
      button: 'bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800',
      iconChar: '⚠️',
    },
    warning: {
      container: 'bg-yellow-50 dark:bg-yellow-950/40 border-yellow-300 dark:border-yellow-800',
      accent: 'border-l-yellow-500 dark:border-l-yellow-600',
      icon: 'text-yellow-500 dark:text-yellow-400',
      button: 'bg-yellow-100 dark:bg-yellow-900/60 text-yellow-700 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800',
      iconChar: '⚠️',
    },
    info: {
      container: 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800',
      accent: 'border-l-blue-500 dark:border-l-blue-600',
      icon: 'text-blue-500 dark:text-blue-400',
      button: 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800',
      iconChar: 'ℹ️',
    },
  }

  const style = styles[type] || styles.error

  return (
    <div
      role="alert"
      className={`rounded-r-lg border border-l-4 p-4 ${style.container} ${style.accent}`}
    >
      <div className="flex items-start gap-3">
        <span className={`text-xl ${style.icon}`} aria-hidden="true">
          {style.iconChar}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-gray-800 dark:text-gray-100">{message}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${style.button}`}
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ErrorMessage

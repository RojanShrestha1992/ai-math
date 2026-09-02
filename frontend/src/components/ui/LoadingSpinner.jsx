/**
 * Reusable CSS-only loading spinner.
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {string} color - Tailwind border color class (default 'indigo')
 * @param {string} [text] - Optional text shown below the spinner
 */
function LoadingSpinner({ size = 'md', color = 'indigo', text }) {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
  }

  const colorClasses = {
    indigo: 'border-indigo-200 border-t-indigo-600 dark:border-indigo-800 dark:border-t-indigo-400',
    white: 'border-white/40 border-t-white',
    gray: 'border-gray-200 border-t-gray-500 dark:border-gray-700 dark:border-t-gray-400',
  }

  const sizeClass = sizes[size] || sizes.md
  const colorClass = colorClasses[color] || colorClasses.indigo

  return (
    <div className="flex flex-col items-center gap-2" role="status" aria-label="Loading">
      <span
        className={`inline-block rounded-full animate-spin ${sizeClass} ${colorClass}`}
        aria-hidden="true"
      />
      {text && <span className="text-sm text-gray-500 dark:text-gray-400">{text}</span>}
    </div>
  )
}

export default LoadingSpinner

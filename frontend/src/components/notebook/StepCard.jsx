function StepCard({ stepNumber, description, expression, index = 0 }) {
  return (
    <div
      className="flex gap-3 items-start border-l-4 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg p-3 animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-500 dark:bg-blue-400 text-white text-sm font-semibold shrink-0">
        {stepNumber}
      </span>
      <div className="min-w-0">
        <p className="text-gray-700 dark:text-gray-200">{description}</p>
        <span className="block mt-1 text-lg font-mono text-indigo-700 dark:text-indigo-300">
          {expression}
        </span>
      </div>
    </div>
  )
}

export default StepCard
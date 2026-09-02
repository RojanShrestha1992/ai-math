/**
 * Skeleton loading state that mimics the solution panel layout.
 * Uses pulsing gray bars to reduce layout shift while solving.
 */
function SolutionSkeleton() {
  const bar = 'animate-pulse rounded bg-gray-200 dark:bg-gray-700'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6" aria-busy="true" aria-label="Loading solution">
      {/* Category badge skeleton */}
      <div className={`${bar} h-6 w-32 rounded-full`} />

      {/* Step skeletons */}
      <div className="space-y-3">
        <div className={`${bar} h-4 w-28`} />
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className={`${bar} w-7 h-7 rounded-full shrink-0`} />
            <div className="flex-1 space-y-2">
              <div className={`${bar} h-3 w-3/4`} />
              <div className={`${bar} h-4 w-1/2`} />
            </div>
          </div>
        ))}
      </div>

      {/* Answer skeleton */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className={`${bar} h-8 w-2/3`} />
      </div>

      {/* Verification skeleton */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className={`${bar} h-4 w-40`} />
      </div>
    </div>
  )
}

export default SolutionSkeleton

/**
 * Displays the verification status of a solution.
 * @param {boolean|null} verified - true (verified), false (failed), null (unverified)
 * @param {string} [details] - Verification details string
 */
function VerificationBadge({ verified, details }) {
  if (verified === true) {
    return (
      <div className="rounded-lg border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/40 p-3">
        <p className="flex items-center gap-2 font-medium text-green-700 dark:text-green-300">
          <span aria-hidden="true">✅</span> Verified
        </p>
        {details && (
          <p className="mt-1 text-sm text-green-700 dark:text-green-300 font-mono">{details}</p>
        )}
      </div>
    )
  }

  if (verified === false) {
    return (
      <div className="rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/40 p-3">
        <p className="flex items-center gap-2 font-medium text-red-700 dark:text-red-300">
          <span aria-hidden="true">❌</span> Verification Failed
        </p>
        {details && (
          <p className="mt-1 text-sm text-red-700 dark:text-red-300 font-mono">{details}</p>
        )}
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          The solution could not be verified. Please double-check.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-950/40 p-3">
      <p className="flex items-center gap-2 font-medium text-yellow-700 dark:text-yellow-300">
        <span aria-hidden="true">⚠️</span> Unverified
      </p>
      <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
        Automatic verification is not available for this problem type.
      </p>
    </div>
  )
}

export default VerificationBadge

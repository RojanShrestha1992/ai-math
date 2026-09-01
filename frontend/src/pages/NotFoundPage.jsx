import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="text-center py-20">
      <h2 className="text-6xl font-bold text-gray-300 dark:text-gray-600">404</h2>
      <p className="text-xl text-gray-500 dark:text-gray-400 mt-4">Page not found</p>
      <Link to="/" className="mt-6 inline-block text-blue-600 dark:text-blue-400 hover:underline">
        ← Back to Notebook
      </Link>
    </div>
  )
}

export default NotFoundPage

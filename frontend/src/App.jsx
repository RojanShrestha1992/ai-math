import { useState, useEffect } from 'react'
import api from './services/api'

function App() {
  const [serverStatus, setServerStatus] = useState('checking...')
  const [dbStatus, setDbStatus] = useState('checking...')

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await api.get('/health')
        setServerStatus(response.data.status)
        setDbStatus(response.data.database)
      } catch (error) {
        setServerStatus('offline')
        setDbStatus('unknown')
      }
    }
    checkHealth()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold text-gray-800">
        AI Math Notebook
      </h1>
      <div className="bg-white rounded-lg shadow-md p-6 space-y-2">
        <p className="text-gray-600">
          Server Status:{' '}
          <span className={serverStatus === 'ok' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
            {serverStatus}
          </span>
        </p>
        <p className="text-gray-600">
          Database:{' '}
          <span className={dbStatus === 'connected' ? 'text-green-600 font-semibold' : 'text-yellow-600 font-semibold'}>
            {dbStatus}
          </span>
        </p>
      </div>
      <p className="text-sm text-gray-400">Phase 0 — Project Initialized</p>
    </div>
  )
}

export default App

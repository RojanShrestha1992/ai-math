import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Future: attach auth token here
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error?.message
      || error.message
      || 'An unexpected error occurred'
    console.error('API Error:', message)
    return Promise.reject(error)
  }
)

export default api

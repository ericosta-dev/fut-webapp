import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import type { AuthTokens } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Token management
const getTokens = (): AuthTokens | null => {
  const tokensStr = localStorage.getItem('auth_tokens')
  if (!tokensStr) return null
  try {
    return JSON.parse(tokensStr) as AuthTokens
  } catch {
    return null
  }
}

const setTokens = (tokens: AuthTokens): void => {
  localStorage.setItem('auth_tokens', JSON.stringify(tokens))
}

const clearTokens = (): void => {
  localStorage.removeItem('auth_tokens')
}

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const tokens = getTokens()
    if (tokens?.access) {
      config.headers.Authorization = `Bearer ${tokens.access}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor - handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const tokens = getTokens()
      if (tokens?.refresh) {
        try {
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: tokens.refresh,
          })

          const newTokens: AuthTokens = {
            access: response.data.access,
            refresh: tokens.refresh,
          }
          setTokens(newTokens)

          originalRequest.headers.Authorization = `Bearer ${newTokens.access}`
          return apiClient(originalRequest)
        } catch {
          // Refresh failed, clear tokens and redirect to login
          clearTokens()
          window.location.href = '/login'
        }
      }
    }

    return Promise.reject(error)
  },
)

export { apiClient, getTokens, setTokens, clearTokens }

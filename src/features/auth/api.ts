import { apiClient, setTokens, clearTokens } from '@/api'
import type { AuthTokens, LoginCredentials, User } from '@/types'

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const response = await apiClient.post<AuthTokens>('/token/', credentials)
    setTokens(response.data)
    return response.data
  },

  async logout(): Promise<void> {
    clearTokens()
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get<User>('/users/me/')
    return response.data
  },

  async refreshToken(refresh: string): Promise<AuthTokens> {
    const response = await apiClient.post<{ access: string }>('/token/refresh/', { refresh })
    return {
      access: response.data.access,
      refresh,
    }
  },
}

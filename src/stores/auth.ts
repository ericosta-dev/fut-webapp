import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, AuthTokens, LoginCredentials } from '@/types'
import { authApi } from '@/features/auth/api'
import { getTokens, clearTokens } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const tokens = ref<AuthTokens | null>(getTokens())
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!tokens.value?.access)

  // Actions
  async function login(credentials: LoginCredentials) {
    loading.value = true
    error.value = null
    try {
      tokens.value = await authApi.login(credentials)
      await fetchUser()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Login failed'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await authApi.logout()
    user.value = null
    tokens.value = null
  }

  async function fetchUser() {
    if (!tokens.value?.access) return
    try {
      user.value = await authApi.getMe()
    } catch {
      // If fetching user fails, clear auth state
      clearTokens()
      tokens.value = null
      user.value = null
    }
  }

  async function initialize() {
    if (tokens.value?.access) {
      await fetchUser()
    }
  }

  return {
    // State
    user,
    tokens,
    loading,
    error,
    // Getters
    isAuthenticated,
    // Actions
    login,
    logout,
    fetchUser,
    initialize,
  }
})

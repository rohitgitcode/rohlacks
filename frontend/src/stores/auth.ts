import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  // 1. Reactive State
  const user = ref<any>(null)
  const token = ref<string | null>(localStorage.getItem('access_token'))
  const loading = ref<boolean>(false)

  // 2. Computed Getters
  const isAuthenticated = computed(() => !!token.value)
  const currentWorkspace = computed(() => user.value?.workspaces?.[0] || null)

  // 3. Actions
  async function register(payload: { fullName: string; email: string; password: string; workspaceName?: string }) {
    loading.value = true
    try {
      const response = await api.post('/auth/register', payload)
      const { user: userData, token: tokenData } = response.data.data

      token.value = tokenData
      user.value = userData
      localStorage.setItem('access_token', tokenData)
      return response.data
    } finally {
      loading.value = false
    }
  }

  async function login(credentials: { email: string; password: string }) {
    loading.value = true
    try {
      const response = await api.post('/auth/login', credentials)
      const { user: userData, token: tokenData } = response.data.data

      token.value = tokenData
      user.value = userData
      localStorage.setItem('access_token', tokenData)
      return response.data
    } finally {
      loading.value = false
    }
  }

  async function fetchCurrentUser() {
    if (!token.value) return null
    try {
      const response = await api.get('/account/me')
      user.value = response.data.data.user
      return user.value
    } catch {
      logout()
      return null
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('access_token')
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    currentWorkspace,
    register,
    login,
    fetchCurrentUser,
    logout,
  }
})
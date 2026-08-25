import { reactive, computed } from 'vue'
import { authApi } from '@/api'
import type { LoginRequest, User } from '@/types'

interface AuthState {
  token: string | null
  user: User | null
  isLoading: boolean
  error: string | null
}

const state = reactive<AuthState>({
  token: localStorage.getItem('token'),
  user: (() => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  })(),
  isLoading: false,
  error: null,
})

const isAuthenticated = computed(() => !!state.token)

async function login(data: LoginRequest) {
  state.isLoading = true
  state.error = null
  try {
    const res = await authApi.login(data)
    if (res.success && res.data) {
      const { token, user } = res.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      state.token = token
      state.user = user
    } else {
      state.error = res.message || '登录失败'
    }
  } catch (err: any) {
    const message = err?.response?.data?.message || '登录失败，请检查网络连接'
    state.error = message
  } finally {
    state.isLoading = false
  }
}

async function logout() {
  try {
    await authApi.logout()
  } catch {
    // ignore
  }
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  state.token = null
  state.user = null
  state.error = null
}

async function fetchProfile() {
  try {
    const res = await authApi.getProfile()
    if (res.success && res.data) {
      localStorage.setItem('user', JSON.stringify(res.data))
      state.user = res.data
    }
  } catch {
    // ignore
  }
}

function clearError() {
  state.error = null
}

export function useAuthStore() {
  return {
    token: computed(() => state.token),
    user: computed(() => state.user),
    isLoading: computed(() => state.isLoading),
    error: computed(() => state.error),
    isAuthenticated,
    login,
    logout,
    fetchProfile,
    clearError,
  }
}

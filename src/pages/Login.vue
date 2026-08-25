<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  username: '',
  password: '',
})

const showPassword = ref(false)
const isSubmitting = ref(false)

const handleSubmit = async () => {
  if (!form.value.username || !form.value.password) return
  isSubmitting.value = true
  try {
    await authStore.login(form.value)
    if (authStore.isAuthenticated.value) {
      router.push('/dashboard')
    }
  } finally {
    isSubmitting.value = false
  }
}

const fillDemoAccount = () => {
  form.value.username = 'admin'
  form.value.password = 'admin123'
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div class="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-10 text-center">
          <div
            class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <Shield class="w-10 h-10 text-white" />
          </div>
          <h1 class="text-2xl font-bold text-white">企业员工管理系统</h1>
          <p class="text-blue-100 mt-2 text-sm">Enterprise Employee Management</p>
        </div>

        <div class="p-8">
          <form @submit.prevent="handleSubmit" class="space-y-5">
            <div>
              <label for="username" class="block text-sm font-medium text-slate-700 mb-1.5">
                用户名
              </label>
              <input
                id="username"
                v-model="form.username"
                type="text"
                placeholder="请输入用户名"
                class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                autocomplete="username"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-slate-700 mb-1.5">
                密码
              </label>
              <div class="relative">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="请输入密码"
                  class="w-full px-4 py-2.5 pr-12 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <Eye v-if="!showPassword" class="w-5 h-5" />
                  <EyeOff v-else class="w-5 h-5" />
                </button>
              </div>
            </div>

            <div v-if="authStore.error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-sm">
              {{ authStore.error }}
            </div>

            <button
              type="submit"
              :disabled="isSubmitting || !form.username || !form.password"
              class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center"
            >
              <Loader2 v-if="isSubmitting" class="w-5 h-5 animate-spin mr-2" />
              {{ isSubmitting ? '登录中...' : '登录' }}
            </button>
          </form>

          <div class="mt-6 pt-6 border-t border-slate-200">
            <p class="text-xs text-center text-slate-500 mb-2">演示账号</p>
            <button
              type="button"
              @click="fillDemoAccount"
              class="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              点击填充管理员账号 (admin / admin123)
            </button>
          </div>
        </div>
      </div>

      <p class="text-center text-blue-200 text-xs mt-6">
        © 2024 Enterprise Employee Management System. All rights reserved.
      </p>
    </div>
  </div>
</template>

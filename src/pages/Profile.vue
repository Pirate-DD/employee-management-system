<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  UserCircle,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  Shield,
  Key,
  Loader2,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/api'
import type { User } from '@/types'

const authStore = useAuthStore()
const user = ref<User | null>(authStore.user.value)
const loading = ref(true)

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const changingPassword = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')

const displayName = computed(() => user.value?.username || '用户')
const displayRole = computed(() => (user.value?.role === 'admin' ? '管理员' : '普通员工'))

const loadProfile = async () => {
  try {
    const res = await authApi.getProfile()
    if (res.success && res.data) {
      user.value = res.data
      authStore.fetchProfile()
    }
  } catch (e) {
    console.error('Failed to fetch profile', e)
  } finally {
    loading.value = false
  }
}

const handleChangePassword = async () => {
  passwordError.value = ''
  passwordSuccess.value = ''

  if (!passwordForm.value.oldPassword || !passwordForm.value.newPassword) {
    passwordError.value = '请填写完整信息'
    return
  }
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = '两次密码输入不一致'
    return
  }
  if (passwordForm.value.newPassword.length < 6) {
    passwordError.value = '新密码至少6位'
    return
  }

  changingPassword.value = true
  try {
    const res = await authApi.changePassword({
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword,
    })
    if (res.success) {
      passwordSuccess.value = '密码修改成功'
      passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token)
      }
    } else {
      passwordError.value = res.message || '修改失败'
    }
  } catch (e: any) {
    passwordError.value = e?.response?.data?.message || '修改失败'
  } finally {
    changingPassword.value = false
  }
}

onMounted(loadProfile)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center">
      <UserCircle class="w-6 h-6 text-blue-600 mr-2" />
      <h1 class="text-xl font-semibold text-slate-800">个人中心</h1>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <Loader2 class="w-8 h-8 animate-spin text-blue-600" />
    </div>

    <template v-else-if="user">
      <!-- Profile Card -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="h-24 bg-gradient-to-r from-blue-500 to-indigo-600" />
        <div class="px-6 pb-6 -mt-12">
          <div class="flex items-end gap-4">
            <div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
              {{ displayName.charAt(0).toUpperCase() }}
            </div>
            <div class="pb-2">
              <h2 class="text-xl font-bold text-slate-800">{{ displayName }}</h2>
              <div class="flex items-center gap-2 mt-1">
                <span class="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  <Shield class="w-3 h-3 mr-1" />
                  {{ displayRole }}
                </span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
            <div class="flex items-center gap-3 py-2">
              <Mail class="w-4 h-4 text-slate-400" />
              <span class="text-sm text-slate-500 w-20">用户名</span>
              <span class="text-sm font-medium text-slate-800">{{ user.username }}</span>
            </div>
            <div class="flex items-center gap-3 py-2">
              <Shield class="w-4 h-4 text-slate-400" />
              <span class="text-sm text-slate-500 w-20">角色</span>
              <span class="text-sm font-medium text-slate-800">{{ displayRole }}</span>
            </div>
            <div class="flex items-center gap-3 py-2">
              <Calendar class="w-4 h-4 text-slate-400" />
              <span class="text-sm text-slate-500 w-20">创建时间</span>
              <span class="text-sm font-medium text-slate-800">{{ new Date(user.createdAt).toLocaleDateString('zh-CN') }}</span>
            </div>
            <div class="flex items-center gap-3 py-2">
              <Calendar class="w-4 h-4 text-slate-400" />
              <span class="text-sm text-slate-500 w-20">更新时间</span>
              <span class="text-sm font-medium text-slate-800">{{ new Date(user.updatedAt).toLocaleDateString('zh-CN') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Change Password -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 class="text-sm font-semibold text-slate-700 mb-4 flex items-center">
          <Key class="w-4 h-4 mr-2 text-blue-600" />
          修改密码
        </h3>
        <div class="space-y-4 max-w-md">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">当前密码</label>
            <input
              v-model="passwordForm.oldPassword"
              type="password"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入当前密码"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">新密码</label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="至少6位"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">确认新密码</label>
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="再次输入新密码"
            />
          </div>

          <div v-if="passwordError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">
            {{ passwordError }}
          </div>
          <div v-if="passwordSuccess" class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded text-sm">
            {{ passwordSuccess }}
          </div>

          <button
            @click="handleChangePassword"
            :disabled="changingPassword"
            class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Loader2 v-if="changingPassword" class="w-4 h-4 animate-spin mr-2" />
            {{ changingPassword ? '提交中...' : '确认修改' }}
          </button>
        </div>
      </div>
    </template>

    <div v-else class="bg-white rounded-xl shadow-sm border border-slate-200 p-10 text-center text-slate-400">
      无法加载用户信息
    </div>
  </div>
</template>

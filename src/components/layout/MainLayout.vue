<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  DollarSign,
  UserCircle,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Shield,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const sidebarCollapsed = ref(false)
const userMenuOpen = ref(false)
const mobileMenuOpen = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)

const closeUserMenu = (e: MouseEvent) => {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target as Node)) {
    userMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeUserMenu)
})
onUnmounted(() => {
  document.removeEventListener('click', closeUserMenu)
})

const menuItems = computed(() => [
  {
    icon: LayoutDashboard,
    label: '数据看板',
    path: '/dashboard',
  },
  {
    icon: Users,
    label: '员工管理',
    path: '/employees',
  },
  {
    icon: Building2,
    label: '部门管理',
    path: '/departments',
  },
  {
    icon: Calendar,
    label: '考勤管理',
    path: '/attendance',
  },
  {
    icon: DollarSign,
    label: '薪资管理',
    path: '/salary',
  },
  {
    icon: UserCircle,
    label: '个人中心',
    path: '/profile',
  },
])

const currentUser = computed(() => authStore.user.value)

const isActive = (path: string) => {
  if (path === '/profile') {
    return route.path === '/profile'
  }
  return route.path.startsWith(path)
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const navigateTo = (path: string) => {
  mobileMenuOpen.value = false
  router.push(path)
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex">
    <!-- Desktop Sidebar -->
    <aside
      class="hidden md:flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300"
      :class="sidebarCollapsed ? 'w-16' : 'w-60'"
    >
      <div class="h-16 flex items-center justify-center border-b border-slate-700">
        <Shield class="w-8 h-8 text-blue-400" />
        <span
          v-if="!sidebarCollapsed"
          class="ml-2 text-lg font-bold whitespace-nowrap"
        >
          员工管理系统
        </span>
      </div>

      <nav class="flex-1 py-4 overflow-y-auto">
        <ul class="space-y-1 px-2">
          <li v-for="item in menuItems" :key="item.path">
            <button
              @click="navigateTo(item.path)"
              class="w-full flex items-center px-3 py-2.5 rounded-lg text-sm transition-colors"
              :class="[
                isActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white',
                sidebarCollapsed ? 'justify-center' : '',
              ]"
            >
              <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
              <span v-if="!sidebarCollapsed" class="ml-3 whitespace-nowrap">
                {{ item.label }}
              </span>
            </button>
          </li>
        </ul>
      </nav>

      <div class="p-3 border-t border-slate-700">
        <button
          @click="handleLogout"
          class="w-full flex items-center px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-red-600 hover:text-white transition-colors"
          :class="sidebarCollapsed ? 'justify-center' : ''"
        >
          <LogOut class="w-5 h-5" />
          <span v-if="!sidebarCollapsed" class="ml-3">退出登录</span>
        </button>
      </div>
    </aside>

    <!-- Mobile Sidebar Overlay -->
    <div
      v-if="mobileMenuOpen"
      class="fixed inset-0 bg-black/50 z-40 md:hidden"
      @click="toggleMobileMenu"
    />

    <!-- Mobile Sidebar -->
    <aside
      class="fixed top-0 left-0 h-full w-60 bg-gradient-to-b from-slate-900 to-slate-800 text-white z-50 transform transition-transform duration-300 md:hidden"
      :class="mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="h-16 flex items-center justify-between px-4 border-b border-slate-700">
        <div class="flex items-center">
          <Shield class="w-8 h-8 text-blue-400" />
          <span class="ml-2 text-lg font-bold">员工管理系统</span>
        </div>
        <button @click="toggleMobileMenu" class="p-1 hover:bg-slate-700 rounded">
          <X class="w-5 h-5" />
        </button>
      </div>

      <nav class="flex-1 py-4 overflow-y-auto">
        <ul class="space-y-1 px-2">
          <li v-for="item in menuItems" :key="item.path">
            <button
              @click="navigateTo(item.path)"
              class="w-full flex items-center px-3 py-2.5 rounded-lg text-sm transition-colors"
              :class="[
                isActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white',
              ]"
            >
              <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
              <span class="ml-3 whitespace-nowrap">{{ item.label }}</span>
            </button>
          </li>
        </ul>
      </nav>

      <div class="p-3 border-t border-slate-700">
        <button
          @click="handleLogout"
          class="w-full flex items-center px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-red-600 hover:text-white transition-colors"
        >
          <LogOut class="w-5 h-5" />
          <span class="ml-3">退出登录</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top Header -->
      <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
        <div class="flex items-center">
          <button
            @click="toggleSidebar"
            class="hidden md:p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Menu class="w-5 h-5 text-slate-600" />
          </button>
          <button
            @click="toggleMobileMenu"
            class="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Menu class="w-5 h-5 text-slate-600" />
          </button>
          <h1 class="ml-4 text-lg font-semibold text-slate-800 hidden sm:block">
            {{ menuItems.find((item) => isActive(item.path))?.label || '员工管理系统' }}
          </h1>
        </div>

        <div ref="userMenuRef" class="relative">
          <button
            @click="userMenuOpen = !userMenuOpen"
            class="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div
              class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium"
            >
              {{ currentUser?.username?.charAt(0).toUpperCase() || 'U' }}
            </div>
            <span class="text-sm font-medium text-slate-700 hidden sm:block">
              {{ currentUser?.username || '用户' }}
            </span>
            <ChevronDown class="w-4 h-4 text-slate-500 hidden sm:block" />
          </button>

          <div
            v-if="userMenuOpen"
            class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50"
          >
            <div class="px-4 py-2 border-b border-slate-100">
              <p class="text-sm font-medium text-slate-800">
                {{ currentUser?.username }}
              </p>
              <p class="text-xs text-slate-500">
                {{ currentUser?.role === 'admin' ? '管理员' : '员工' }}
              </p>
            </div>
            <button
              @click="userMenuOpen = false; navigateTo('/profile')"
              class="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center"
            >
              <UserCircle class="w-4 h-4 mr-2" />
              个人中心
            </button>
            <button
              @click="userMenuOpen = false; handleLogout()"
              class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
            >
              <LogOut class="w-4 h-4 mr-2" />
              退出登录
            </button>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-4 md:p-6 overflow-auto">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

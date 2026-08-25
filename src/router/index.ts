import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/pages/Dashboard.vue'),
      },
      {
        path: 'employees',
        name: 'employee-list',
        component: () => import('@/pages/EmployeeList.vue'),
      },
      {
        path: 'employees/new',
        name: 'employee-new',
        component: () => import('@/pages/EmployeeForm.vue'),
      },
      {
        path: 'employees/:id',
        name: 'employee-detail',
        component: () => import('@/pages/EmployeeDetail.vue'),
      },
      {
        path: 'employees/:id/edit',
        name: 'employee-edit',
        component: () => import('@/pages/EmployeeForm.vue'),
      },
      {
        path: 'departments',
        name: 'departments',
        component: () => import('@/pages/DepartmentList.vue'),
      },
      {
        path: 'attendance',
        name: 'attendance',
        component: () => import('@/pages/Attendance.vue'),
      },
      {
        path: 'salary',
        name: 'salary',
        component: () => import('@/pages/SalaryList.vue'),
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/pages/Profile.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth !== false && !token) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else if (to.path === '/login' && token) {
    next({ path: '/dashboard' })
  } else {
    next()
  }
})

export default router

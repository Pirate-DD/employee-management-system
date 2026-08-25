<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Edit3,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Building2,
  Loader2,
} from 'lucide-vue-next'
import { employeeApi, departmentApi } from '@/api'
import type { Employee, Department } from '@/types'

const route = useRoute()
const router = useRouter()

const employee = ref<Employee | null>(null)
const departments = ref<Department[]>([])
const loading = ref(true)

const statusMap: Record<string, { label: string; class: string }> = {
  active: { label: '在职', class: 'bg-emerald-100 text-emerald-700' },
  'on-leave': { label: '请假', class: 'bg-amber-100 text-amber-700' },
  resigned: { label: '离职', class: 'bg-slate-100 text-slate-600' },
}

const fetchData = async () => {
  loading.value = true
  try {
    const [empRes, deptRes] = await Promise.all([
      employeeApi.getById(route.params.id as string),
      departmentApi.list(),
    ])
    if (empRes.success && empRes.data) {
      employee.value = empRes.data
    }
    if (deptRes.success && deptRes.data) {
      departments.value = deptRes.data
    }
  } catch (e) {
    console.error('Failed to fetch employee', e)
  } finally {
    loading.value = false
  }
}

const getDeptName = (deptId: string) => {
  const dept = departments.value.find((d) => d.id === deptId)
  return dept?.name || '-'
}

onMounted(fetchData)
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button
          @click="router.back()"
          class="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft class="w-5 h-5 text-slate-600" />
        </button>
        <h1 class="text-xl font-semibold text-slate-800">员工详情</h1>
      </div>
      <button
        v-if="employee"
        @click="router.push(`/employees/${employee.id}/edit`)"
        class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <Edit3 class="w-4 h-4 mr-1" />
        编辑
      </button>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <Loader2 class="w-8 h-8 animate-spin text-blue-600" />
    </div>

    <template v-else-if="employee">
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
            {{ employee.name.charAt(0) }}
          </div>
          <div>
            <h2 class="text-xl font-bold text-slate-800">{{ employee.name }}</h2>
            <div class="flex items-center gap-2 mt-1">
              <span
                class="inline-flex px-2 py-0.5 text-xs font-medium rounded-full"
                :class="statusMap[employee.status].class"
              >
                {{ statusMap[employee.status].label }}
              </span>
              <span class="text-sm text-slate-500">{{ employee.position }}</span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div class="flex items-center gap-3 py-2 border-b border-slate-100">
            <Briefcase class="w-4 h-4 text-slate-400" />
            <span class="text-sm text-slate-500 w-20">岗位</span>
            <span class="text-sm font-medium text-slate-800">{{ employee.position }}</span>
          </div>
          <div class="flex items-center gap-3 py-2 border-b border-slate-100">
            <Building2 class="w-4 h-4 text-slate-400" />
            <span class="text-sm text-slate-500 w-20">部门</span>
            <span class="text-sm font-medium text-slate-800">{{ getDeptName(employee.departmentId) }}</span>
          </div>
          <div class="flex items-center gap-3 py-2 border-b border-slate-100">
            <Phone class="w-4 h-4 text-slate-400" />
            <span class="text-sm text-slate-500 w-20">电话</span>
            <span class="text-sm font-medium text-slate-800">{{ employee.phone || '-' }}</span>
          </div>
          <div class="flex items-center gap-3 py-2 border-b border-slate-100">
            <Mail class="w-4 h-4 text-slate-400" />
            <span class="text-sm text-slate-500 w-20">邮箱</span>
            <span class="text-sm font-medium text-slate-800">{{ employee.email || '-' }}</span>
          </div>
          <div class="flex items-center gap-3 py-2 border-b border-slate-100">
            <Calendar class="w-4 h-4 text-slate-400" />
            <span class="text-sm text-slate-500 w-20">入职日期</span>
            <span class="text-sm font-medium text-slate-800">{{ employee.hireDate }}</span>
          </div>
          <div class="flex items-center gap-3 py-2 border-b border-slate-100">
            <MapPin class="w-4 h-4 text-slate-400" />
            <span class="text-sm text-slate-500 w-20">性别</span>
            <span class="text-sm font-medium text-slate-800">{{ employee.gender === 'male' ? '男' : '女' }}</span>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-slate-100">
          <p class="text-xs text-slate-400">
            创建时间：{{ new Date(employee.createdAt).toLocaleString('zh-CN') }}
          </p>
        </div>
      </div>
    </template>

    <div v-else class="bg-white rounded-xl shadow-sm border border-slate-200 p-10 text-center text-slate-400">
      员工不存在
    </div>
  </div>
</template>

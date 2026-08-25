<script setup lang="ts">
import type { OverviewStats } from '@/types'
import { Users, Building2, Calendar, AlertCircle } from 'lucide-vue-next'

defineProps<{
  overview: OverviewStats | null
  loading: boolean
}>()

const statCards = [
  { key: 'employees', title: '员工总数', icon: Users, color: 'from-blue-500 to-blue-600' },
  { key: 'departments', title: '部门数量', icon: Building2, color: 'from-indigo-500 to-indigo-600' },
  { key: 'attendance', title: '今日考勤', icon: Calendar, color: 'from-emerald-500 to-emerald-600' },
  { key: 'leaves', title: '待处理请假', icon: AlertCircle, color: 'from-amber-500 to-amber-600' },
]

const getValue = (key: string, data: OverviewStats | null) => {
  if (!data) return 0
  switch (key) {
    case 'employees': return data.totalEmployees
    case 'departments': return data.totalDepartments
    case 'attendance': return data.todayAttendance
    case 'leaves': return data.pendingLeaves
    default: return 0
  }
}

const getSubtitle = (key: string, data: OverviewStats | null) => {
  if (!data) return ''
  switch (key) {
    case 'employees': return `活跃 ${data.activeEmployees} 人`
    case 'departments': return '组织架构'
    case 'attendance': return '已打卡人数'
    case 'leaves': return '待审批'
    default: return ''
  }
}
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <div
      v-for="card in statCards"
      :key="card.key"
      class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-slate-500">{{ card.title }}</p>
          <p class="text-2xl font-bold text-slate-800 mt-1">{{ getValue(card.key, overview) }}</p>
          <p class="text-xs text-slate-400 mt-1">{{ getSubtitle(card.key, overview) }}</p>
        </div>
        <div
          class="w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center"
          :class="card.color"
        >
          <component :is="card.icon" class="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  </div>
</template>

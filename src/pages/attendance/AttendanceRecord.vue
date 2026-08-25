<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { attendanceApi, employeeApi } from '@/api'
import type { Attendance, AttendanceStatus } from '@/types'

const employees = ref<{ id: string; name: string }[]>([])
const list = ref<Attendance[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const employeeFilter = ref('')
const statusFilter = ref('')
const dateFilter = ref('')

const statusMap: Record<AttendanceStatus, { label: string; class: string }> = {
  normal: { label: '正常', class: 'bg-emerald-100 text-emerald-700' },
  late: { label: '迟到', class: 'bg-amber-100 text-amber-700' },
  early: { label: '早退', class: 'bg-orange-100 text-orange-700' },
  absent: { label: '缺勤', class: 'bg-red-100 text-red-700' },
}

const getEmpName = (id: string) => employees.value.find((e) => e.id === id)?.name || '-'

const totalPages = () => Math.ceil(total.value / pageSize.value)

const fetchEmployees = async () => {
  try {
    const res = await employeeApi.list({ pageSize: 100 })
    if (res.success && res.data) {
      employees.value = res.data.list.map((e) => ({ id: e.id, name: e.name }))
    }
  } catch { /* ignore */ }
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await attendanceApi.list({
      employeeId: employeeFilter.value || undefined,
      status: statusFilter.value as AttendanceStatus || undefined,
      startDate: dateFilter.value || undefined,
      endDate: dateFilter.value || undefined,
      page: page.value,
      pageSize: pageSize.value,
    })
    if (res.success && res.data) {
      list.value = res.data.list
      total.value = res.data.total
    }
  } catch { /* ignore */ }
  loading.value = false
}

const pageNumbers = () => {
  const total = totalPages()
  const current = page.value
  const max = 5
  let start = Math.max(1, current - Math.floor(max / 2))
  let end = Math.min(total, start + max - 1)
  if (end - start + 1 < max) start = Math.max(1, end - max + 1)
  const pages: number[] = []
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
}

const goToPage = (p: number) => {
  if (p < 1 || p > totalPages()) return
  page.value = p
  fetchData()
}

const emit = defineEmits<{
  (e: 'update:employeeFilter', v: string): void
}>()

onMounted(async () => {
  await fetchEmployees()
  fetchData()
})
</script>

<template>
  <div class="p-4">
    <div class="flex flex-col md:flex-row gap-3 mb-4">
      <select
        v-model="employeeFilter"
        class="px-4 py-2 border border-slate-300 rounded-lg text-sm"
      >
        <option value="">全部员工</option>
        <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
      </select>
      <select v-model="statusFilter" class="px-4 py-2 border border-slate-300 rounded-lg text-sm">
        <option value="">全部状态</option>
        <option value="normal">正常</option>
        <option value="late">迟到</option>
        <option value="early">早退</option>
        <option value="absent">缺勤</option>
      </select>
      <input v-model="dateFilter" type="date" class="px-4 py-2 border border-slate-300 rounded-lg text-sm" />
      <button @click="page = 1; fetchData()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
        查询
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-slate-600">员工</th>
            <th class="px-4 py-3 text-left font-medium text-slate-600">日期</th>
            <th class="px-4 py-3 text-left font-medium text-slate-600">签到</th>
            <th class="px-4 py-3 text-left font-medium text-slate-600">签退</th>
            <th class="px-4 py-3 text-left font-medium text-slate-600">状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="5" class="px-4 py-10 text-center">
              <Loader2 class="w-6 h-6 animate-spin mx-auto text-blue-600" />
            </td>
          </tr>
          <tr v-else-if="!list.length">
            <td colspan="5" class="px-4 py-10 text-center text-slate-400">暂无考勤数据</td>
          </tr>
          <tr v-else v-for="att in list" :key="att.id" class="border-b border-slate-100">
            <td class="px-4 py-3 text-slate-700">{{ getEmpName(att.employeeId) }}</td>
            <td class="px-4 py-3 text-slate-600">{{ att.date }}</td>
            <td class="px-4 py-3 text-slate-600">{{ att.checkIn ? new Date(att.checkIn).toLocaleTimeString('zh-CN') : '-' }}</td>
            <td class="px-4 py-3 text-slate-600">{{ att.checkOut ? new Date(att.checkOut).toLocaleTimeString('zh-CN') : '-' }}</td>
            <td class="px-4 py-3">
              <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full" :class="statusMap[att.status].class">
                {{ statusMap[att.status].label }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="total > pageSize" class="flex items-center justify-between mt-4">
      <p class="text-sm text-slate-600">共 {{ total }} 条</p>
      <div class="flex items-center gap-1">
        <button @click="goToPage(page - 1)" :disabled="page <= 1" class="p-1 rounded border border-slate-300 disabled:opacity-50">
          <ChevronLeft class="w-4 h-4" />
        </button>
        <button
          v-for="p in pageNumbers()"
          :key="p"
          @click="goToPage(p)"
          :class="[
            'px-3 py-1.5 rounded border text-sm',
            p === page ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 text-slate-600 hover:bg-white',
          ]"
        >{{ p }}</button>
        <button @click="goToPage(page + 1)" :disabled="page >= totalPages()" class="p-1 rounded border border-slate-300 disabled:opacity-50">
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

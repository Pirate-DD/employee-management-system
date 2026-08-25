<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Trash2, Loader2, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { salaryApi, employeeApi } from '@/api'
import type { SalaryRecord } from '@/types'

const employees = ref<{ id: string; name: string }[]>([])
const records = ref<SalaryRecord[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const empFilter = ref('')
const monthFilter = ref('')
const loading = ref(false)

const getEmpName = (id: string) => employees.value.find((e) => e.id === id)?.name || '-'

const totalPages = () => Math.ceil(total.value / pageSize.value)

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
    const res = await salaryApi.listRecords({
      employeeId: empFilter.value || undefined,
      month: monthFilter.value || undefined,
      page: page.value,
      pageSize: pageSize.value,
    })
    if (res.success && res.data) {
      records.value = res.data.list
      total.value = res.data.total
    }
  } catch { /* ignore */ }
  loading.value = false
}

const goToPage = (p: number) => {
  if (p < 1 || p > totalPages()) return
  page.value = p
  fetchData()
}

const deleteRecord = async (record: SalaryRecord) => {
  if (!confirm('确定删除该薪资记录吗？')) return
  try {
    const res = await salaryApi.deleteRecord(record.id)
    if (res.success) fetchData()
  } catch { alert('删除失败') }
}

onMounted(async () => {
  await fetchEmployees()
  fetchData()
})
</script>

<template>
  <div class="p-4">
    <div class="flex items-center justify-between mb-4">
      <div class="flex gap-2">
        <select v-model="empFilter" class="px-4 py-2 border border-slate-300 rounded-lg text-sm">
          <option value="">全部员工</option>
          <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
        </select>
        <input v-model="monthFilter" type="month" class="px-4 py-2 border border-slate-300 rounded-lg text-sm" />
        <button @click="page = 1; fetchData()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
          查询
        </button>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-slate-600">员工</th>
            <th class="px-4 py-3 text-left font-medium text-slate-600">月份</th>
            <th class="px-4 py-3 text-right font-medium text-slate-600">基本工资</th>
            <th class="px-4 py-3 text-right font-medium text-slate-600">绩效</th>
            <th class="px-4 py-3 text-right font-medium text-slate-600">加班费</th>
            <th class="px-4 py-3 text-right font-medium text-slate-600">扣款</th>
            <th class="px-4 py-3 text-right font-medium text-slate-600">合计</th>
            <th class="px-4 py-3 text-right font-medium text-slate-600">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="8" class="px-4 py-10 text-center">
              <Loader2 class="w-6 h-6 animate-spin mx-auto text-blue-600" />
            </td>
          </tr>
          <tr v-else-if="!records.length">
            <td colspan="8" class="px-4 py-10 text-center text-slate-400">暂无薪资记录</td>
          </tr>
          <tr v-else v-for="rec in records" :key="rec.id" class="border-b border-slate-100">
            <td class="px-4 py-3 text-slate-700">{{ getEmpName(rec.employeeId) }}</td>
            <td class="px-4 py-3 text-slate-600">{{ rec.month }}</td>
            <td class="px-4 py-3 text-right text-slate-600">¥{{ rec.baseSalary.toLocaleString() }}</td>
            <td class="px-4 py-3 text-right text-slate-600">¥{{ rec.performanceBonus.toLocaleString() }}</td>
            <td class="px-4 py-3 text-right text-slate-600">¥{{ rec.overtimePay.toLocaleString() }}</td>
            <td class="px-4 py-3 text-right text-slate-600">¥{{ rec.leaveDeduction.toLocaleString() }}</td>
            <td class="px-4 py-3 text-right font-bold text-blue-600">¥{{ rec.total.toLocaleString() }}</td>
            <td class="px-4 py-3 text-right">
              <button @click="deleteRecord(rec)" class="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded">
                <Trash2 class="w-4 h-4" />
              </button>
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

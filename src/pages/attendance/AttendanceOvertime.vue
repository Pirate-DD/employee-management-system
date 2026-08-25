<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, CheckCircle, XCircle, Loader2 } from 'lucide-vue-next'
import { attendanceApi, employeeApi } from '@/api'
import type { Overtime } from '@/types'

const employees = ref<{ id: string; name: string }[]>([])
const list = ref<Overtime[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const statusFilter = ref('')
const loading = ref(false)

const showModal = ref(false)
const form = ref({
  employeeId: '',
  date: new Date().toISOString().substring(0, 10),
  hours: 1,
  reason: '',
})

const statusMap: Record<string, { label: string; class: string }> = {
  pending: { label: '待审批', class: 'bg-amber-100 text-amber-700' },
  approved: { label: '已批准', class: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: '已拒绝', class: 'bg-red-100 text-red-700' },
}

const getEmpName = (id: string) => employees.value.find((e) => e.id === id)?.name || '-'

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
    const res = await attendanceApi.listOvertimes({
      status: statusFilter.value || undefined,
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

const submit = async () => {
  if (!form.value.employeeId || !form.value.hours) return
  try {
    const res = await attendanceApi.applyOvertime(form.value)
    if (res.success) {
      showModal.value = false
      form.value = { employeeId: '', date: new Date().toISOString().substring(0, 10), hours: 1, reason: '' }
      fetchData()
    }
  } catch (e) { alert('提交失败') }
}

const approve = async (id: string, approve: boolean) => {
  try {
    const res = await attendanceApi.approveOvertime(id, approve)
    if (res.success) fetchData()
  } catch { alert('操作失败') }
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
        <select v-model="statusFilter" class="px-4 py-2 border border-slate-300 rounded-lg text-sm">
          <option value="">全部状态</option>
          <option value="pending">待审批</option>
          <option value="approved">已批准</option>
          <option value="rejected">已拒绝</option>
        </select>
        <button @click="page = 1; fetchData()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
          查询
        </button>
      </div>
      <button
        @click="showModal = true"
        class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
      >
        <Plus class="w-4 h-4 mr-1" />
        申请加班
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-slate-600">员工</th>
            <th class="px-4 py-3 text-left font-medium text-slate-600">日期</th>
            <th class="px-4 py-3 text-left font-medium text-slate-600">时长</th>
            <th class="px-4 py-3 text-left font-medium text-slate-600">原因</th>
            <th class="px-4 py-3 text-left font-medium text-slate-600">状态</th>
            <th class="px-4 py-3 text-right font-medium text-slate-600">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="px-4 py-10 text-center">
              <Loader2 class="w-6 h-6 animate-spin mx-auto text-blue-600" />
            </td>
          </tr>
          <tr v-else-if="!list.length">
            <td colspan="6" class="px-4 py-10 text-center text-slate-400">暂无加班记录</td>
          </tr>
          <tr v-else v-for="ot in list" :key="ot.id" class="border-b border-slate-100">
            <td class="px-4 py-3 text-slate-700">{{ getEmpName(ot.employeeId) }}</td>
            <td class="px-4 py-3 text-slate-600">{{ ot.date }}</td>
            <td class="px-4 py-3 text-slate-600">{{ ot.hours }} 小时</td>
            <td class="px-4 py-3 text-slate-600 max-w-xs truncate">{{ ot.reason }}</td>
            <td class="px-4 py-3">
              <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full" :class="statusMap[ot.status].class">
                {{ statusMap[ot.status].label }}
              </span>
            </td>
            <td class="px-4 py-3 text-right">
              <template v-if="ot.status === 'pending'">
                <button @click="approve(ot.id, true)" class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded">
                  <CheckCircle class="w-4 h-4" />
                </button>
                <button @click="approve(ot.id, false)" class="p-1.5 text-red-600 hover:bg-red-50 rounded">
                  <XCircle class="w-4 h-4" />
                </button>
              </template>
              <span v-else class="text-xs text-slate-400">已处理</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showModal = false">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 class="text-lg font-semibold text-slate-800 mb-4">申请加班</h3>
        <div class="space-y-4">
          <select v-model="form.employeeId" class="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm">
            <option value="">请选择员工</option>
            <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
          </select>
          <div class="grid grid-cols-2 gap-3">
            <input v-model="form.date" type="date" class="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" />
            <input v-model.number="form.hours" type="number" min="1" max="12" class="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
          <textarea v-model="form.reason" rows="3" class="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm resize-none" placeholder="请填写加班原因" />
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button @click="showModal = false" class="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm">取消</button>
          <button @click="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">提交</button>
        </div>
      </div>
    </div>
  </div>
</template>

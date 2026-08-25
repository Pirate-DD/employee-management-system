<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { LogIn, LogOut, Loader2 } from 'lucide-vue-next'
import { attendanceApi, employeeApi } from '@/api'

const props = defineProps<{
  mode: 'checkin' | 'checkout'
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const employees = ref<{ id: string; name: string }[]>([])
const employeeId = ref('')
const date = ref(new Date().toISOString().substring(0, 10))
const loading = ref(false)

const title = props.mode === 'checkin' ? '员工打卡' : '员工签退'
const icon = props.mode === 'checkin' ? LogIn : LogOut

const fetchEmployees = async () => {
  try {
    const res = await employeeApi.list({ pageSize: 100 })
    if (res.success && res.data) {
      employees.value = res.data.list.map((e) => ({ id: e.id, name: e.name }))
    }
  } catch { /* ignore */ }
}

const handleSubmit = async () => {
  if (!employeeId.value) return
  loading.value = true
  try {
    const dto = { employeeId: employeeId.value, date: date.value }
    const res = props.mode === 'checkin'
      ? await attendanceApi.checkIn(dto)
      : await attendanceApi.checkOut(dto)
    if (res.success) {
      emit('success')
      emit('close')
    }
  } catch (e) {
    alert('操作失败')
  }
  loading.value = false
}

onMounted(fetchEmployees)
</script>

<template>
  <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="emit('close')">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
      <h3 class="text-lg font-semibold text-slate-800 mb-4">{{ title }}</h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">选择员工</label>
          <select v-model="employeeId" class="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm">
            <option value="">请选择员工</option>
            <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">日期</label>
          <input v-model="date" type="date" class="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" />
        </div>
      </div>
      <div class="flex justify-end gap-2 mt-6">
        <button @click="emit('close')" class="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm">取消</button>
        <button
          @click="handleSubmit"
          :disabled="loading"
          class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm"
        >
          <Loader2 v-if="loading" class="w-4 h-4 animate-spin mr-2" />
          <component v-else :is="icon" class="w-4 h-4 mr-2" />
          {{ loading ? '处理中...' : '确认' }}
        </button>
      </div>
    </div>
  </div>
</template>

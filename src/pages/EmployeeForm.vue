<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Save, Loader2 } from 'lucide-vue-next'
import { employeeApi, departmentApi } from '@/api'
import type {
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
  Department,
  Gender,
  EmployeeStatus,
} from '@/types'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const employeeId = computed(() => route.params.id as string)

const departments = ref<Department[]>([])
const loading = ref(false)
const saving = ref(false)

const form = ref<CreateEmployeeDTO>({
  name: '',
  gender: 'male',
  departmentId: '',
  position: '',
  phone: '',
  email: '',
  hireDate: new Date().toISOString().substring(0, 10),
  status: 'active',
})

const fetchDepartments = async () => {
  try {
    const res = await departmentApi.list()
    if (res.success && res.data) {
      departments.value = res.data
      if (!form.value.departmentId && res.data.length) {
        form.value.departmentId = res.data[0].id
      }
    }
  } catch {
    // ignore
  }
}

const fetchEmployee = async () => {
  if (!isEdit.value) return
  loading.value = true
  try {
    const res = await employeeApi.getById(employeeId.value)
    if (res.success && res.data) {
      const emp = res.data
      form.value = {
        name: emp.name,
        gender: emp.gender,
        departmentId: emp.departmentId,
        position: emp.position,
        phone: emp.phone,
        email: emp.email,
        hireDate: emp.hireDate,
        status: emp.status,
      }
    }
  } catch (e) {
    console.error('Failed to fetch employee', e)
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!form.value.name || !form.value.departmentId || !form.value.position) {
    alert('请填写必填字段')
    return
  }
  saving.value = true
  try {
    if (isEdit.value) {
      const dto: UpdateEmployeeDTO = { ...form.value }
      const res = await employeeApi.update(employeeId.value, dto)
      if (res.success) {
        router.push('/employees')
      }
    } else {
      const res = await employeeApi.create(form.value)
      if (res.success) {
        router.push('/employees')
      }
    }
  } catch (e) {
    console.error('Failed to save employee', e)
    alert('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await fetchDepartments()
  await fetchEmployee()
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <button
        @click="router.back()"
        class="p-2 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <ArrowLeft class="w-5 h-5 text-slate-600" />
      </button>
      <h1 class="text-xl font-semibold text-slate-800">
        {{ isEdit ? '编辑员工' : '新增员工' }}
      </h1>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <Loader2 class="w-8 h-8 animate-spin text-blue-600" />
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 class="text-sm font-semibold text-slate-700 mb-4 border-b border-slate-100 pb-3">
          基本信息
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">
              姓名 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入员工姓名"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">性别</label>
            <div class="flex gap-4 pt-2">
              <label class="flex items-center">
                <input
                  v-model="form.gender"
                  type="radio"
                  value="male"
                  class="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-slate-700">男</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="form.gender"
                  type="radio"
                  value="female"
                  class="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-slate-700">女</span>
              </label>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">
              部门 <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.departmentId"
              required
              class="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">请选择部门</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">
              岗位 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.position"
              type="text"
              required
              class="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="如：前端工程师"
            />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 class="text-sm font-semibold text-slate-700 mb-4 border-b border-slate-100 pb-3">
          联系信息
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">电话</label>
            <input
              v-model="form.phone"
              type="tel"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入联系电话"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">邮箱</label>
            <input
              v-model="form.email"
              type="email"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入电子邮箱"
            />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 class="text-sm font-semibold text-slate-700 mb-4 border-b border-slate-100 pb-3">
          工作信息
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">入职日期</label>
            <input
              v-model="form.hireDate"
              type="date"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">状态</label>
            <select
              v-model="form.status"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="active">在职</option>
              <option value="on-leave">请假</option>
              <option value="resigned">离职</option>
            </select>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3">
        <button
          type="button"
          @click="router.back()"
          class="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          取消
        </button>
        <button
          type="submit"
          :disabled="saving"
          class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Loader2 v-if="saving" class="w-4 h-4 animate-spin mr-2" />
          <Save v-else class="w-4 h-4 mr-2" />
          {{ saving ? '保存中...' : '保存' }}
        </button>
      </div>
    </form>
  </div>
</template>

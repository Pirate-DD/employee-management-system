<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Users,
} from 'lucide-vue-next'
import { employeeApi, departmentApi } from '@/api'
import type { Employee, Department, EmployeeStatus } from '@/types'

const router = useRouter()

const employees = ref<Employee[]>([])
const departments = ref<Department[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const searchKeyword = ref('')
const filterDept = ref<string>('')
const filterStatus = ref<string>('')

const statusMap: Record<EmployeeStatus, { label: string; class: string }> = {
  active: { label: '在职', class: 'bg-emerald-100 text-emerald-700' },
  'on-leave': { label: '请假', class: 'bg-amber-100 text-amber-700' },
  resigned: { label: '离职', class: 'bg-slate-100 text-slate-600' },
}

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

const pageNumbers = computed(() => {
  const total = totalPages.value
  const current = page.value
  const max = 5
  let start = Math.max(1, current - Math.floor(max / 2))
  let end = Math.min(total, start + max - 1)
  if (end - start + 1 < max) {
    start = Math.max(1, end - max + 1)
  }
  const pages: number[] = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const fetchDepartments = async () => {
  try {
    const res = await departmentApi.list()
    if (res.success && res.data) {
      departments.value = res.data
    }
  } catch {
    // ignore
  }
}

const fetchEmployees = async () => {
  loading.value = true
  try {
    const res = await employeeApi.list({
      keyword: searchKeyword.value || undefined,
      departmentId: filterDept.value || undefined,
      status: filterStatus.value as EmployeeStatus || undefined,
      page: page.value,
      pageSize: pageSize.value,
    })
    if (res.success && res.data) {
      employees.value = res.data.list
      total.value = res.data.total
    }
  } catch (e) {
    console.error('Failed to fetch employees', e)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  fetchEmployees()
}

const handleReset = () => {
  searchKeyword.value = ''
  filterDept.value = ''
  filterStatus.value = ''
  page.value = 1
  fetchEmployees()
}

const goToPage = (p: number) => {
  if (p < 1 || p > totalPages.value) return
  page.value = p
  fetchEmployees()
}

const viewEmployee = (id: string) => {
  router.push(`/employees/${id}`)
}

const editEmployee = (id: string) => {
  router.push(`/employees/${id}/edit`)
}

const deleteEmployee = async (id: string) => {
  if (!confirm('确定要删除该员工吗？此操作不可恢复。')) return
  try {
    const res = await employeeApi.delete(id)
    if (res.success) {
      fetchEmployees()
    }
  } catch (e) {
    console.error('Failed to delete employee', e)
    alert('删除失败')
  }
}

const getDeptName = (deptId: string) => {
  const dept = departments.value.find((d) => d.id === deptId)
  return dept?.name || '-'
}

onMounted(async () => {
  await fetchDepartments()
  fetchEmployees()
})
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div class="flex items-center">
        <Users class="w-6 h-6 text-blue-600 mr-2" />
        <h1 class="text-xl font-semibold text-slate-800">员工管理</h1>
      </div>
      <button
        @click="router.push('/employees/new')"
        class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <Plus class="w-4 h-4 mr-1" />
        新增员工
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <div class="flex flex-col md:flex-row gap-3">
        <div class="flex-1 relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索员工姓名、工号、电话..."
            class="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @keyup.enter="handleSearch"
          />
        </div>
        <select
          v-model="filterDept"
          class="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">全部部门</option>
          <option v-for="dept in departments" :key="dept.id" :value="dept.id">
            {{ dept.name }}
          </option>
        </select>
        <select
          v-model="filterStatus"
          class="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">全部状态</option>
          <option value="active">在职</option>
          <option value="on-leave">请假</option>
          <option value="resigned">离职</option>
        </select>
        <div class="flex gap-2">
          <button
            @click="handleSearch"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            搜索
          </button>
          <button
            @click="handleReset"
            class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
          >
            重置
          </button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-4 py-3 text-left font-medium text-slate-600">姓名</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">性别</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">部门</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">岗位</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">电话</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">邮箱</th>
              <th class="px-4 py-3 text-left font-medium text-slate-600">状态</th>
              <th class="px-4 py-3 text-right font-medium text-slate-600">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="8" class="px-4 py-10 text-center text-slate-400">
                <Loader2 class="w-6 h-6 animate-spin mx-auto" />
              </td>
            </tr>
            <tr v-else-if="!employees.length">
              <td colspan="8" class="px-4 py-10 text-center text-slate-400">
                暂无员工数据
              </td>
            </tr>
            <tr
              v-else
              v-for="emp in employees"
              :key="emp.id"
              class="border-b border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <td class="px-4 py-3 font-medium text-slate-800">{{ emp.name }}</td>
              <td class="px-4 py-3 text-slate-600">{{ emp.gender === 'male' ? '男' : '女' }}</td>
              <td class="px-4 py-3 text-slate-600">{{ getDeptName(emp.departmentId) }}</td>
              <td class="px-4 py-3 text-slate-600">{{ emp.position }}</td>
              <td class="px-4 py-3 text-slate-600">{{ emp.phone }}</td>
              <td class="px-4 py-3 text-slate-600">{{ emp.email }}</td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                  :class="statusMap[emp.status].class"
                >
                  {{ statusMap[emp.status].label }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button
                    @click="viewEmployee(emp.id)"
                    class="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="查看"
                  >
                    <Eye class="w-4 h-4" />
                  </button>
                  <button
                    @click="editEmployee(emp.id)"
                    class="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                    title="编辑"
                  >
                    <Edit3 class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteEmployee(emp.id)"
                    class="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="删除"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="total > pageSize"
        class="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50"
      >
        <p class="text-sm text-slate-600">
          共 <span class="font-medium text-slate-800">{{ total }}</span> 条记录，
          第 <span class="font-medium text-slate-800">{{ page }}</span> /
          <span class="font-medium text-slate-800"> {{ totalPages }}</span> 页
        </p>
        <div class="flex items-center gap-1">
          <button
            @click="goToPage(page - 1)"
            :disabled="page <= 1"
            class="p-1.5 rounded border border-slate-300 text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          <button
            v-for="p in pageNumbers"
            :key="p"
            @click="goToPage(p)"
            :class="[
              'px-3 py-1.5 rounded border text-sm transition-colors',
              p === page
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-slate-300 text-slate-600 hover:bg-white',
            ]"
          >
            {{ p }}
          </button>
          <button
            @click="goToPage(page + 1)"
            :disabled="page >= totalPages"
            class="p-1.5 rounded border border-slate-300 text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

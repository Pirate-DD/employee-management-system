<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Edit3, Trash2, Loader2, Save, X } from 'lucide-vue-next'
import { salaryApi } from '@/api'
import type { SalaryPlan, CreateSalaryPlanDTO, UpdateSalaryPlanDTO } from '@/types'

const plans = ref<SalaryPlan[]>([])
const loading = ref(false)
const showModal = ref(false)
const editingPlan = ref<SalaryPlan | null>(null)
const planForm = ref<CreateSalaryPlanDTO>({ name: '', position: '', baseSalary: 0, performanceBonus: 0 })

const fetchData = async () => {
  loading.value = true
  try {
    const res = await salaryApi.listPlans()
    if (res.success && res.data) plans.value = res.data
  } catch { /* ignore */ }
  loading.value = false
}

const openAdd = () => {
  editingPlan.value = null
  planForm.value = { name: '', position: '', baseSalary: 0, performanceBonus: 0 }
  showModal.value = true
}

const openEdit = (plan: SalaryPlan) => {
  editingPlan.value = plan
  planForm.value = { name: plan.name, position: plan.position, baseSalary: plan.baseSalary, performanceBonus: plan.performanceBonus }
  showModal.value = true
}

const savePlan = async () => {
  if (!planForm.value.name || !planForm.value.baseSalary) return
  try {
    if (editingPlan.value) {
      const dto: UpdateSalaryPlanDTO = { ...planForm.value }
      const res = await salaryApi.updatePlan(editingPlan.value.id, dto)
      if (res.success) { showModal.value = false; fetchData() }
    } else {
      const res = await salaryApi.createPlan(planForm.value)
      if (res.success) { showModal.value = false; fetchData() }
    }
  } catch { alert('保存失败') }
}

const deletePlan = async (plan: SalaryPlan) => {
  if (!confirm(`确定删除"${plan.name}"吗？`)) return
  try {
    const res = await salaryApi.deletePlan(plan.id)
    if (res.success) fetchData()
  } catch { alert('删除失败') }
}

onMounted(fetchData)
</script>

<template>
  <div class="p-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-semibold text-slate-700">薪资方案</h3>
      <button
        @click="openAdd"
        class="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
      >
        <Plus class="w-4 h-4 mr-1" />
        新增方案
      </button>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-10">
      <Loader2 class="w-6 h-6 animate-spin text-blue-600" />
    </div>
    <div v-else-if="!plans.length" class="py-10 text-center text-slate-400">
      暂无薪资方案
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="plan in plans" :key="plan.id" class="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-sm font-semibold text-slate-800">{{ plan.name }}</h3>
            <span class="text-xs text-slate-500">{{ plan.position }}</span>
          </div>
          <div class="flex gap-1">
            <button @click="openEdit(plan)" class="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded">
              <Edit3 class="w-4 h-4" />
            </button>
            <button @click="deletePlan(plan)" class="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
        <div class="mt-4 space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-slate-500">基本工资</span>
            <span class="font-medium text-slate-800">¥{{ plan.baseSalary.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-500">绩效奖金</span>
            <span class="font-medium text-slate-800">¥{{ plan.performanceBonus.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between text-sm pt-2 border-t border-slate-100">
            <span class="text-slate-500">合计</span>
            <span class="font-bold text-blue-600">¥{{ (plan.baseSalary + plan.performanceBonus).toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showModal = false">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 class="text-lg font-semibold text-slate-800 mb-4">{{ editingPlan ? '编辑方案' : '新增方案' }}</h3>
        <div class="space-y-4">
          <input v-model="planForm.name" type="text" class="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" placeholder="方案名称" />
          <input v-model="planForm.position" type="text" class="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" placeholder="适用岗位" />
          <div class="grid grid-cols-2 gap-3">
            <input v-model.number="planForm.baseSalary" type="number" min="0" class="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" placeholder="基本工资" />
            <input v-model.number="planForm.performanceBonus" type="number" min="0" class="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" placeholder="绩效奖金" />
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button @click="showModal = false" class="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm">取消</button>
          <button @click="savePlan" class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
            <Save class="w-4 h-4 mr-1" />
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

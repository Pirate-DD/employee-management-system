<script setup lang="ts">
import { ref } from 'vue'
import { DollarSign, Settings, FileText } from 'lucide-vue-next'
import { salaryApi } from '@/api'
import SalaryPlans from './salary/SalaryPlans.vue'
import SalaryRecords from './salary/SalaryRecords.vue'

type TabType = 'plans' | 'records'

const activeTab = ref<TabType>('plans')

const generateMonthly = async () => {
  const month = prompt('请输入生成薪资的月份（格式：YYYY-MM）', new Date().toISOString().substring(0, 7))
  if (!month) return
  try {
    const res = await salaryApi.generateMonthly(month)
    if (res.success) alert('薪资生成成功')
  } catch { alert('生成失败') }
}

const tabs = [
  { key: 'plans' as TabType, label: '薪资方案', icon: Settings },
  { key: 'records' as TabType, label: '薪资记录', icon: FileText },
]
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <DollarSign class="w-6 h-6 text-blue-600 mr-2" />
        <h1 class="text-xl font-semibold text-slate-800">薪资管理</h1>
      </div>
      <button
        v-if="activeTab === 'records'"
        @click="generateMonthly"
        class="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg"
      >
        <Settings class="w-4 h-4 mr-1" />
        生成月薪
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200">
      <div class="flex border-b border-slate-200">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors',
            activeTab === tab.key
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700',
          ]"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
        </button>
      </div>

      <SalaryPlans v-if="activeTab === 'plans'" />
      <SalaryRecords v-if="activeTab === 'records'" />
    </div>
  </div>
</template>

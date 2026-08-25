<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { Building2, Users, Calendar, Briefcase, DollarSign, TrendingUp } from 'lucide-vue-next'
import type {
  DepartmentStats,
  AttendanceStats,
  SalaryStats,
  PositionDistribution,
  GenderDistribution,
  MonthlyTrend,
} from '@/types'

const props = defineProps<{
  deptStats: DepartmentStats[]
  attendanceStats: AttendanceStats | null
  salaryStats: SalaryStats | null
  positionDist: PositionDistribution[]
  genderDist: GenderDistribution[]
  trend: MonthlyTrend[]
}>()

const deptChartEl = ref<HTMLElement | null>(null)
const genderChartEl = ref<HTMLElement | null>(null)
const attendanceChartEl = ref<HTMLElement | null>(null)
const trendChartEl = ref<HTMLElement | null>(null)

let deptChart: echarts.ECharts | null = null
let genderChart: echarts.ECharts | null = null
let attendanceChart: echarts.ECharts | null = null
let trendChart: echarts.ECharts | null = null

const initCharts = () => {
  if (!deptChartEl.value || !genderChartEl.value || !attendanceChartEl.value || !trendChartEl.value) return

  deptChart?.dispose()
  genderChart?.dispose()
  attendanceChart?.dispose()
  trendChart?.dispose()

  deptChart = echarts.init(deptChartEl.value)
  genderChart = echarts.init(genderChartEl.value)
  attendanceChart = echarts.init(attendanceChartEl.value)
  trendChart = echarts.init(trendChartEl.value)

  deptChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 10, right: 10, top: 10, bottom: 30, containLabel: true },
    xAxis: { type: 'category', data: props.deptStats.map((d) => d.departmentName), axisLine: { lineStyle: { color: '#cbd5e1' } }, axisLabel: { color: '#64748b', fontSize: 11 } },
    yAxis: { type: 'value', axisLine: { lineStyle: { color: '#cbd5e1' } }, axisLabel: { color: '#64748b' }, splitLine: { lineStyle: { color: '#e2e8f0' } } },
    series: [{
      type: 'bar',
      data: props.deptStats.map((d) => d.employeeCount),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#3b82f6' }, { offset: 1, color: '#1e40af' }]),
        borderRadius: [4, 4, 0, 0],
      },
      barWidth: '50%',
    }],
  })

  genderChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, left: 'center' },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data: props.genderDist.map((g) => ({ name: g.gender === 'male' ? '男' : '女', value: g.count })),
      color: ['#3b82f6', '#ec4899'],
    }],
  })

  if (props.attendanceStats) {
    attendanceChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0, left: 'center', itemWidth: 10, itemHeight: 10 },
      series: [{
        type: 'pie',
        radius: ['0%', '65%'],
        label: { formatter: '{b}: {c}天 ({d}%)', fontSize: 11 },
        data: [
          { value: props.attendanceStats.normalDays, name: '正常', itemStyle: { color: '#10b981' } },
          { value: props.attendanceStats.lateDays, name: '迟到', itemStyle: { color: '#f59e0b' } },
          { value: props.attendanceStats.earlyDays, name: '早退', itemStyle: { color: '#f97316' } },
          { value: props.attendanceStats.absentDays, name: '缺勤', itemStyle: { color: '#ef4444' } },
        ],
      }],
    })
  }

  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['员工数量', '出勤人次'], bottom: 0 },
    grid: { left: 10, right: 10, top: 10, bottom: 40, containLabel: true },
    xAxis: { type: 'category', data: props.trend.map((t) => t.month), axisLine: { lineStyle: { color: '#cbd5e1' } }, axisLabel: { color: '#64748b', fontSize: 11 } },
    yAxis: { type: 'value', axisLine: { lineStyle: { color: '#cbd5e1' } }, axisLabel: { color: '#64748b' }, splitLine: { lineStyle: { color: '#e2e8f0' } } },
    series: [
      { name: '员工数量', type: 'line', smooth: true, data: props.trend.map((t) => t.employees), itemStyle: { color: '#3b82f6' },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(59, 130, 246, 0.3)' }, { offset: 1, color: 'rgba(59, 130, 246, 0)' }]) } },
      { name: '出勤人次', type: 'line', smooth: true, data: props.trend.map((t) => t.attendance), itemStyle: { color: '#10b981' },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(16, 185, 129, 0.3)' }, { offset: 1, color: 'rgba(16, 185, 129, 0)' }]) } },
    ],
  })
}

const handleResize = () => {
  deptChart?.resize()
  genderChart?.resize()
  attendanceChart?.resize()
  trendChart?.resize()
}

onMounted(async () => {
  await nextTick()
  initCharts()
  window.addEventListener('resize', handleResize)
})

watch(() => [props.deptStats, props.attendanceStats, props.genderDist, props.trend], () => {
  nextTick(initCharts)
}, { deep: true })

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  deptChart?.dispose()
  genderChart?.dispose()
  attendanceChart?.dispose()
  trendChart?.dispose()
})
</script>

<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h3 class="text-sm font-semibold text-slate-700 mb-4 flex items-center">
          <Building2 class="w-4 h-4 mr-2 text-blue-600" />
          部门人员分布
        </h3>
        <div ref="deptChartEl" class="h-64" />
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h3 class="text-sm font-semibold text-slate-700 mb-4 flex items-center">
          <Users class="w-4 h-4 mr-2 text-pink-600" />
          性别比例
        </h3>
        <div ref="genderChartEl" class="h-64" />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h3 class="text-sm font-semibold text-slate-700 mb-4 flex items-center">
          <Calendar class="w-4 h-4 mr-2 text-emerald-600" />
          考勤状况
        </h3>
        <div ref="attendanceChartEl" class="h-64" />
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h3 class="text-sm font-semibold text-slate-700 mb-4 flex items-center">
          <Briefcase class="w-4 h-4 mr-2 text-indigo-600" />
          岗位分布
        </h3>
        <div class="space-y-3">
          <div v-for="pos in positionDist" :key="pos.position" class="flex items-center justify-between">
            <span class="text-sm text-slate-600">{{ pos.position }}</span>
            <span class="text-sm font-medium text-slate-800">{{ pos.count }}人</span>
          </div>
          <div v-if="!positionDist.length" class="text-sm text-slate-400 text-center py-4">
            暂无数据
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h3 class="text-sm font-semibold text-slate-700 mb-4 flex items-center">
          <DollarSign class="w-4 h-4 mr-2 text-amber-600" />
          薪资概览
        </h3>
        <div v-if="salaryStats" class="space-y-4">
          <div class="flex justify-between items-center pb-3 border-b border-slate-100">
            <span class="text-sm text-slate-500">薪资总额</span>
            <span class="text-lg font-bold text-slate-800">¥{{ salaryStats.totalAmount.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between items-center pb-3 border-b border-slate-100">
            <span class="text-sm text-slate-500">基本工资</span>
            <span class="text-sm font-medium text-slate-700">¥{{ salaryStats.baseTotal.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between items-center pb-3 border-b border-slate-100">
            <span class="text-sm text-slate-500">绩效奖金</span>
            <span class="text-sm font-medium text-slate-700">¥{{ salaryStats.bonusTotal.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-slate-500">加班费</span>
            <span class="text-sm font-medium text-slate-700">¥{{ salaryStats.overtimeTotal.toLocaleString() }}</span>
          </div>
        </div>
        <div v-else class="text-sm text-slate-400 text-center py-8">暂无数据</div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <h3 class="text-sm font-semibold text-slate-700 mb-4 flex items-center">
        <TrendingUp class="w-4 h-4 mr-2 text-blue-600" />
        月度趋势
      </h3>
      <div ref="trendChartEl" class="h-72" />
    </div>
  </div>
</template>

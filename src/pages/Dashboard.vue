<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import { statisticsApi } from '@/api'
import type {
  OverviewStats,
  DepartmentStats,
  AttendanceStats,
  SalaryStats,
  PositionDistribution,
  GenderDistribution,
  MonthlyTrend,
} from '@/types'
import StatCards from './dashboard/StatCards.vue'
import DashboardCharts from './dashboard/DashboardCharts.vue'

const overview = ref<OverviewStats | null>(null)
const deptStats = ref<DepartmentStats[]>([])
const attendanceStats = ref<AttendanceStats | null>(null)
const salaryStats = ref<SalaryStats | null>(null)
const positionDist = ref<PositionDistribution[]>([])
const genderDist = ref<GenderDistribution[]>([])
const trend = ref<MonthlyTrend[]>([])
const loading = ref(true)

const fetchData = async () => {
  loading.value = true
  try {
    const [ov, ds, as, ss, pd, gd, tr] = await Promise.all([
      statisticsApi.getOverview(),
      statisticsApi.getDepartmentStats(),
      statisticsApi.getAttendanceStats(),
      statisticsApi.getSalaryStats(),
      statisticsApi.getPositionDistribution(),
      statisticsApi.getGenderDistribution(),
      statisticsApi.getMonthlyTrend(6),
    ])
    if (ov.success) overview.value = ov.data
    if (ds.success) deptStats.value = ds.data || []
    if (as.success) attendanceStats.value = as.data
    if (ss.success) salaryStats.value = ss.data
    if (pd.success) positionDist.value = pd.data || []
    if (gd.success) genderDist.value = gd.data || []
    if (tr.success) trend.value = tr.data || []
  } catch (e) {
    console.error('Failed to fetch dashboard data', e)
  }
  loading.value = false
}

onMounted(fetchData)
</script>

<template>
  <div class="space-y-6">
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>

    <template v-else>
      <StatCards :overview="overview" :loading="loading" />
      <DashboardCharts
        :dept-stats="deptStats"
        :attendance-stats="attendanceStats"
        :salary-stats="salaryStats"
        :position-dist="positionDist"
        :gender-dist="genderDist"
        :trend="trend"
      />
    </template>
  </div>
</template>

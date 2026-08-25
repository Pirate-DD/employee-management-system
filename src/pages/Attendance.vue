<script setup lang="ts">
import { ref } from 'vue'
import { Calendar, Clock, LogIn, LogOut, FileText, Briefcase } from 'lucide-vue-next'
import AttendanceRecord from './attendance/AttendanceRecord.vue'
import AttendanceLeave from './attendance/AttendanceLeave.vue'
import AttendanceOvertime from './attendance/AttendanceOvertime.vue'
import AttendanceModal from './attendance/AttendanceModal.vue'

type TabType = 'attendance' | 'leave' | 'overtime'

const activeTab = ref<TabType>('attendance')
const showCheckIn = ref(false)
const showCheckOut = ref(false)
const refreshKey = ref(0)

const tabs = [
  { key: 'attendance' as TabType, label: '考勤记录', icon: Clock },
  { key: 'leave' as TabType, label: '请假管理', icon: FileText },
  { key: 'overtime' as TabType, label: '加班管理', icon: Briefcase },
]

const handleModalSuccess = () => {
  refreshKey.value++
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <Calendar class="w-6 h-6 text-blue-600 mr-2" />
        <h1 class="text-xl font-semibold text-slate-800">考勤管理</h1>
      </div>
      <div class="flex gap-2">
        <button
          @click="showCheckIn = true"
          class="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg"
        >
          <LogIn class="w-4 h-4 mr-1" />
          打卡
        </button>
        <button
          @click="showCheckOut = true"
          class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
        >
          <LogOut class="w-4 h-4 mr-1" />
          签退
        </button>
      </div>
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

      <AttendanceRecord v-if="activeTab === 'attendance'" :key="'rec-' + refreshKey" />
      <AttendanceLeave v-if="activeTab === 'leave'" :key="'leave-' + refreshKey" />
      <AttendanceOvertime v-if="activeTab === 'overtime'" :key="'ot-' + refreshKey" />
    </div>

    <AttendanceModal
      v-if="showCheckIn"
      mode="checkin"
      @close="showCheckIn = false"
      @success="handleModalSuccess"
    />
    <AttendanceModal
      v-if="showCheckOut"
      mode="checkout"
      @close="showCheckOut = false"
      @success="handleModalSuccess"
    />
  </div>
</template>

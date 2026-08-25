<script setup lang="ts">
import { ref, computed } from 'vue'
import { Save } from 'lucide-vue-next'
import { departmentApi } from '@/api'
import type { Department, CreateDepartmentDTO } from '@/types'

interface DepartmentNode extends Department {
  children: DepartmentNode[]
  expanded: boolean
  editing: boolean
  editData: { name: string; description: string }
}

const props = defineProps<{
  show: boolean
  parentId: string | null
  departments: Department[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created'): void
}>()

const form = ref<CreateDepartmentDTO>({ name: '', description: '' })

const parentName = computed(() => {
  if (!props.parentId) return '顶级部门'
  const parent = props.departments.find((d) => d.id === props.parentId)
  return parent?.name || '顶级部门'
})

const handleSubmit = async () => {
  if (!form.value.name.trim()) return
  try {
    const dto: CreateDepartmentDTO = {
      name: form.value.name,
      parentId: props.parentId || null,
      description: form.value.description,
    }
    const res = await departmentApi.create(dto)
    if (res.success) {
      form.value = { name: '', description: '' }
      emit('created')
      emit('close')
    }
  } catch (e) {
    alert('创建失败')
  }
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
      <h3 class="text-lg font-semibold text-slate-800 mb-4">
        新增部门
        <span class="text-sm text-slate-500 ml-2">（父级：{{ parentName }}）</span>
      </h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">
            部门名称 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            class="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入部门名称"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">描述</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="部门描述（可选）"
          />
        </div>
      </div>
      <div class="flex justify-end gap-2 mt-6">
        <button
          @click="emit('close')"
          class="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm"
        >
          取消
        </button>
        <button
          @click="handleSubmit"
          class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
        >
          <Save class="w-4 h-4 mr-1" />
          创建
        </button>
      </div>
    </div>
  </div>
</template>

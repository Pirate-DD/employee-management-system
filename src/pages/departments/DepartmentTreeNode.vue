<script setup lang="ts">
import { computed } from 'vue'
import { Building2, ChevronRight, ChevronDown, Edit3, Trash2, Plus, Save, X } from 'lucide-vue-next'
import type { Department } from '@/types'

interface DepartmentNode extends Department {
  children: DepartmentNode[]
  expanded: boolean
  editing: boolean
  editData: { name: string; description: string }
}

const props = defineProps<{
  node: DepartmentNode
  level: number
}>()

const emit = defineEmits<{
  (e: 'toggle', node: DepartmentNode): void
  (e: 'edit', node: DepartmentNode): void
  (e: 'save', node: DepartmentNode): void
  (e: 'cancel', node: DepartmentNode): void
  (e: 'delete', node: DepartmentNode): void
  (e: 'add-child', node: DepartmentNode): void
}>()

const childLevel = computed(() => props.level + 1)

const colorClass = computed(() => {
  if (props.level === 0) return 'text-blue-500'
  if (props.level === 1) return 'text-indigo-500'
  return 'text-emerald-500'
})

const bgHoverClass = computed(() => {
  if (props.level === 0) return 'hover:bg-slate-50'
  return 'hover:bg-slate-50'
})
</script>

<template>
  <div>
    <div
      v-if="!node.editing"
      class="flex items-center gap-2 px-3 py-2 rounded-lg group transition-colors"
      :class="bgHoverClass"
      :style="{ paddingLeft: (level * 24 + 12) + 'px' }"
    >
      <button
        v-if="node.children.length"
        @click="emit('toggle', node)"
        class="p-1 rounded hover:bg-slate-200"
      >
        <ChevronDown v-if="node.expanded" class="w-4 h-4 text-slate-500" />
        <ChevronRight v-else class="w-4 h-4 text-slate-500" />
      </button>
      <div v-else class="w-6" />
      <Building2 class="w-4 h-4" :class="colorClass" />
      <span class="text-sm font-medium text-slate-800">{{ node.name }}</span>
      <span v-if="node.description" class="text-xs text-slate-400 truncate max-w-xs">
        {{ node.description }}
      </span>
      <div class="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button @click="emit('add-child', node)" class="p-1 rounded hover:bg-blue-100 text-blue-600" title="添加子部门">
          <Plus class="w-4 h-4" />
        </button>
        <button @click="emit('edit', node)" class="p-1 rounded hover:bg-amber-100 text-amber-600" title="编辑">
          <Edit3 class="w-4 h-4" />
        </button>
        <button @click="emit('delete', node)" class="p-1 rounded hover:bg-red-100 text-red-600" title="删除">
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>
    <div
      v-else
      class="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg"
      :style="{ paddingLeft: (level * 24 + 12) + 'px' }"
    >
      <input
        v-model="node.editData.name"
        class="flex-1 px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="部门名称"
      />
      <input
        v-model="node.editData.description"
        class="flex-1 px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hidden md:block"
        placeholder="描述（可选）"
      />
      <button @click="emit('save', node)" class="p-1 rounded hover:bg-blue-100 text-blue-600">
        <Save class="w-4 h-4" />
      </button>
      <button @click="emit('cancel', node)" class="p-1 rounded hover:bg-slate-200 text-slate-500">
        <X class="w-4 h-4" />
      </button>
    </div>

    <template v-if="node.expanded && node.children.length">
      <DepartmentTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="childLevel"
        @toggle="emit('toggle', $event)"
        @edit="emit('edit', $event)"
        @save="emit('save', $event)"
        @cancel="emit('cancel', $event)"
        @delete="emit('delete', $event)"
        @add-child="emit('add-child', $event)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Building2, Plus, Loader2 } from 'lucide-vue-next'
import { departmentApi } from '@/api'
import type { Department, UpdateDepartmentDTO } from '@/types'
import DepartmentTreeNode from './departments/DepartmentTreeNode.vue'
import DepartmentModal from './departments/DepartmentModal.vue'

interface DepartmentNode extends Department {
  children: DepartmentNode[]
  expanded: boolean
  editing: boolean
  editData: { name: string; description: string }
}

const tree = ref<DepartmentNode[]>([])
const flatDepartments = ref<Department[]>([])
const loading = ref(false)
const showModal = ref(false)
const addParentId = ref<string | null>(null)

const buildTree = (items: Department[]): DepartmentNode[] => {
  const map = new Map<string, DepartmentNode>()
  const roots: DepartmentNode[] = []
  for (const item of items) {
    map.set(item.id, {
      ...item,
      children: [],
      expanded: true,
      editing: false,
      editData: { name: item.name, description: item.description || '' },
    })
  }
  for (const item of items) {
    const node = map.get(item.id)!
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }
  return roots
}

const countNodes = (nodes: DepartmentNode[]): number => {
  let count = 0
  for (const n of nodes) {
    count++
    if (n.children.length) count += countNodes(n.children)
  }
  return count
}

const totalCount = computed(() => countNodes(tree.value))

const fetchData = async () => {
  loading.value = true
  try {
    const [flatRes, treeRes] = await Promise.all([
      departmentApi.list(),
      departmentApi.getTree(),
    ])
    if (flatRes.success && flatRes.data) {
      flatDepartments.value = flatRes.data
    }
    if (treeRes.success && treeRes.data) {
      tree.value = buildTree(treeRes.data)
    } else if (flatRes.success && flatRes.data) {
      tree.value = buildTree(flatRes.data)
    }
  } catch (e) {
    console.error('Failed to fetch departments', e)
  }
  loading.value = false
}

const handleToggle = (node: DepartmentNode) => {
  node.expanded = !node.expanded
}

const handleEdit = (node: DepartmentNode) => {
  node.editData = { name: node.name, description: node.description || '' }
  node.editing = true
}

const handleSave = async (node: DepartmentNode) => {
  if (!node.editData.name.trim()) return
  try {
    const dto: UpdateDepartmentDTO = {
      name: node.editData.name,
      description: node.editData.description,
    }
    const res = await departmentApi.update(node.id, dto)
    if (res.success) {
      node.name = node.editData.name
      node.description = node.editData.description
      node.editing = false
    }
  } catch (e) {
    alert('更新失败')
  }
}

const handleCancel = (node: DepartmentNode) => {
  node.editing = false
}

const handleDelete = async (node: DepartmentNode) => {
  if (!confirm(`确定删除部门"${node.name}"吗？子部门也将被删除。`)) return
  try {
    const res = await departmentApi.delete(node.id)
    if (res.success) fetchData()
  } catch {
    alert('删除失败')
  }
}

const handleAddChild = (node: DepartmentNode) => {
  addParentId.value = node.id
  showModal.value = true
}

const openAddRoot = () => {
  addParentId.value = null
  showModal.value = true
}

onMounted(fetchData)
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <Building2 class="w-6 h-6 text-blue-600 mr-2" />
        <h1 class="text-xl font-semibold text-slate-800">部门管理</h1>
        <span class="ml-3 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">
          共 {{ totalCount }} 个部门
        </span>
      </div>
      <button
        @click="openAddRoot"
        class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
      >
        <Plus class="w-4 h-4 mr-1" />
        新增部门
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center py-20">
        <Loader2 class="w-8 h-8 animate-spin text-blue-600" />
      </div>
      <div v-else-if="!tree.length" class="py-10 text-center text-slate-400">
        暂无部门数据
      </div>
      <div v-else class="p-2">
        <DepartmentTreeNode
          v-for="node in tree"
          :key="node.id"
          :node="node"
          :level="0"
          @toggle="handleToggle"
          @edit="handleEdit"
          @save="handleSave"
          @cancel="handleCancel"
          @delete="handleDelete"
          @add-child="handleAddChild"
        />
      </div>
    </div>

    <DepartmentModal
      :show="showModal"
      :parent-id="addParentId"
      :departments="flatDepartments"
      @close="showModal = false"
      @created="fetchData"
    />
  </div>
</template>

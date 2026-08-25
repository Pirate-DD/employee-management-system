import { store, type Department } from '../data/store.js'

export interface CreateDepartmentDTO {
  name: string
  parentId?: string | null
  managerId?: string | null
  description?: string
}

export interface UpdateDepartmentDTO extends Partial<CreateDepartmentDTO> {}

export const departmentService = {
  list() {
    const departments = Array.from(store.departments.values())
    return { success: true, data: departments }
  },

  getById(id: string) {
    const dept = store.departments.get(id)
    if (!dept) {
      return { success: false, message: '部门不存在' }
    }
    return { success: true, data: dept }
  },

  create(dto: CreateDepartmentDTO) {
    const name = dto.name.trim()
    if (!name) {
      return { success: false, message: '部门名称不能为空' }
    }

    const exists = Array.from(store.departments.values()).some((d) => d.name === name)
    if (exists) {
      return { success: false, message: '部门名称已存在' }
    }

    if (dto.parentId && !store.departments.has(dto.parentId)) {
      return { success: false, message: '上级部门不存在' }
    }

    const now = new Date().toISOString()
    const id = store.generateId()
    const department: Department = {
      id,
      name,
      parentId: dto.parentId || null,
      managerId: dto.managerId || null,
      description: dto.description || '',
      createdAt: now,
    }
    store.departments.set(id, department)
    return { success: true, data: department, message: '创建成功' }
  },

  update(id: string, dto: UpdateDepartmentDTO) {
    const dept = store.departments.get(id)
    if (!dept) {
      return { success: false, message: '部门不存在' }
    }

    if (dto.parentId && dto.parentId === id) {
      return { success: false, message: '不能将自身设为上级部门' }
    }

    if (dto.parentId && !store.departments.has(dto.parentId)) {
      return { success: false, message: '上级部门不存在' }
    }

    const updated: Department = {
      ...dept,
      ...dto,
      parentId: dto.parentId !== undefined ? dto.parentId : dept.parentId,
      managerId: dto.managerId !== undefined ? dto.managerId : dept.managerId,
    }
    store.departments.set(id, updated)
    return { success: true, data: updated, message: '更新成功' }
  },

  delete(id: string) {
    const dept = store.departments.get(id)
    if (!dept) {
      return { success: false, message: '部门不存在' }
    }

    const hasChildren = Array.from(store.departments.values()).some((d) => d.parentId === id)
    if (hasChildren) {
      return { success: false, message: '存在下级部门，无法删除' }
    }

    const hasEmployees = Array.from(store.employees.values()).some((e) => e.departmentId === id)
    if (hasEmployees) {
      return { success: false, message: '部门下还有员工，无法删除' }
    }

    store.departments.delete(id)
    return { success: true, message: '删除成功' }
  },

  getTree() {
    const departments = Array.from(store.departments.values())
    const map = new Map<string, Department & { children: any[] }>()
    const roots: any[] = []

    for (const dept of departments) {
      map.set(dept.id, { ...dept, children: [] })
    }

    for (const dept of departments) {
      const node = map.get(dept.id)!
      if (dept.parentId && map.has(dept.parentId)) {
        map.get(dept.parentId)!.children.push(node)
      } else {
        roots.push(node)
      }
    }

    return { success: true, data: roots }
  },
}
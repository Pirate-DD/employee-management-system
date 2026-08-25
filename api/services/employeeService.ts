import { store, type Employee } from '../data/store.js'

export interface CreateEmployeeDTO {
  userId?: string
  name: string
  gender: 'male' | 'female'
  departmentId: string
  position: string
  phone: string
  email: string
  hireDate: string
  status?: 'active' | 'on-leave' | 'resigned'
}

export interface UpdateEmployeeDTO extends Partial<CreateEmployeeDTO> {
  status?: 'active' | 'on-leave' | 'resigned'
}

export interface EmployeeQuery {
  keyword?: string
  departmentId?: string
  status?: string
  page?: number
  pageSize?: number
}

export const employeeService = {
  list(query: EmployeeQuery = {}) {
    let list = Array.from(store.employees.values())

    if (query.keyword) {
      const kw = query.keyword.toLowerCase()
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(kw) ||
          e.position.toLowerCase().includes(kw) ||
          e.phone.includes(kw) ||
          e.email.toLowerCase().includes(kw)
      )
    }

    if (query.departmentId) {
      list = list.filter((e) => e.departmentId === query.departmentId)
    }

    if (query.status) {
      list = list.filter((e) => e.status === query.status)
    }

    const total = list.length
    const page = query.page || 1
    const pageSize = query.pageSize || 10
    const start = (page - 1) * pageSize
    const items = list.slice(start, start + pageSize)

    return { success: true, data: { list: items, total, page, pageSize } }
  },

  getById(id: string) {
    const employee = store.employees.get(id)
    if (!employee) {
      return { success: false, message: '员工不存在' }
    }
    return { success: true, data: employee }
  },

  create(dto: CreateEmployeeDTO) {
    const now = new Date().toISOString()
    const id = store.generateId()
    const employee: Employee = {
      id,
      userId: dto.userId || store.generateId(),
      name: dto.name,
      gender: dto.gender,
      departmentId: dto.departmentId,
      position: dto.position,
      phone: dto.phone || '',
      email: dto.email || '',
      hireDate: dto.hireDate,
      status: dto.status || 'active',
      createdAt: now,
      updatedAt: now,
    }
    store.employees.set(id, employee)
    return { success: true, data: employee, message: '创建成功' }
  },

  update(id: string, dto: UpdateEmployeeDTO) {
    const employee = store.employees.get(id)
    if (!employee) {
      return { success: false, message: '员工不存在' }
    }

    const updated: Employee = {
      ...employee,
      ...dto,
      updatedAt: new Date().toISOString(),
    }
    store.employees.set(id, updated)
    return { success: true, data: updated, message: '更新成功' }
  },

  delete(id: string) {
    const employee = store.employees.get(id)
    if (!employee) {
      return { success: false, message: '员工不存在' }
    }
    store.employees.delete(id)
    return { success: true, message: '删除成功' }
  },

  getByUserId(userId: string) {
    const employee = Array.from(store.employees.values()).find(
      (e) => e.userId === userId
    )
    if (!employee) {
      return { success: false, message: '员工不存在' }
    }
    return { success: true, data: employee }
  },

  countByDepartment(departmentId: string) {
    return Array.from(store.employees.values()).filter(
      (e) => e.departmentId === departmentId && e.status === 'active'
    ).length
  },
}
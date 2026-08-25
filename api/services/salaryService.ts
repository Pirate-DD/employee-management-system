import { store, type SalaryPlan, type SalaryRecord } from '../data/store.js'

export interface CreatePlanDTO {
  name: string
  position: string
  baseSalary: number
  performanceBonus: number
}

export interface UpdatePlanDTO extends Partial<CreatePlanDTO> {}

export interface CreateRecordDTO {
  employeeId: string
  month: string
  baseSalary: number
  performanceBonus: number
  overtimePay?: number
  leaveDeduction?: number
}

export interface UpdateRecordDTO extends Partial<CreateRecordDTO> {}

export interface RecordQuery {
  employeeId?: string
  month?: string
  position?: string
  page?: number
  pageSize?: number
}

export const salaryService = {
  listPlans() {
    const plans = Array.from(store.salaryPlans.values())
    return { success: true, data: plans }
  },

  getPlanById(id: string) {
    const plan = store.salaryPlans.get(id)
    if (!plan) return { success: false, message: '薪资方案不存在' }
    return { success: true, data: plan }
  },

  createPlan(dto: CreatePlanDTO) {
    const name = dto.name.trim()
    if (!name) return { success: false, message: '方案名称不能为空' }

    const exists = Array.from(store.salaryPlans.values()).some((p) => p.name === name)
    if (exists) return { success: false, message: '方案名称已存在' }

    const now = new Date().toISOString()
    const id = store.generateId()
    const plan: SalaryPlan = { id, ...dto, createdAt: now }
    store.salaryPlans.set(id, plan)
    return { success: true, data: plan, message: '创建成功' }
  },

  updatePlan(id: string, dto: UpdatePlanDTO) {
    const plan = store.salaryPlans.get(id)
    if (!plan) return { success: false, message: '薪资方案不存在' }

    const updated: SalaryPlan = { ...plan, ...dto }
    store.salaryPlans.set(id, updated)
    return { success: true, data: updated, message: '更新成功' }
  },

  deletePlan(id: string) {
    if (!store.salaryPlans.has(id)) return { success: false, message: '薪资方案不存在' }
    store.salaryPlans.delete(id)
    return { success: true, message: '删除成功' }
  },

  listRecords(query: RecordQuery = {}) {
    let list = Array.from(store.salaryRecords.values())

    if (query.employeeId) list = list.filter((r) => r.employeeId === query.employeeId)
    if (query.month) list = list.filter((r) => r.month === query.month)

    list.sort((a, b) => b.month.localeCompare(a.month))

    const total = list.length
    const page = query.page || 1
    const pageSize = query.pageSize || 10
    const start = (page - 1) * pageSize
    const items = list.slice(start, start + pageSize)

    return { success: true, data: { list: items, total, page, pageSize } }
  },

  getRecordById(id: string) {
    const record = store.salaryRecords.get(id)
    if (!record) return { success: false, message: '薪资记录不存在' }
    return { success: true, data: record }
  },

  createRecord(dto: CreateRecordDTO) {
    const employee = store.employees.get(dto.employeeId)
    if (!employee) return { success: false, message: '员工不存在' }

    const now = new Date().toISOString()
    const id = store.generateId()
    const overtimePay = dto.overtimePay || 0
    const leaveDeduction = dto.leaveDeduction || 0
    const total = dto.baseSalary + dto.performanceBonus + overtimePay - leaveDeduction

    const record: SalaryRecord = {
      id,
      employeeId: dto.employeeId,
      month: dto.month,
      baseSalary: dto.baseSalary,
      performanceBonus: dto.performanceBonus,
      overtimePay,
      leaveDeduction,
      total,
      createdAt: now,
    }
    store.salaryRecords.set(id, record)
    return { success: true, data: record, message: '创建成功' }
  },

  updateRecord(id: string, dto: UpdateRecordDTO) {
    const record = store.salaryRecords.get(id)
    if (!record) return { success: false, message: '薪资记录不存在' }

    const updated: SalaryRecord = {
      ...record,
      ...dto,
      total: 0,
    }
    updated.total = updated.baseSalary + updated.performanceBonus + updated.overtimePay - updated.leaveDeduction
    store.salaryRecords.set(id, updated)
    return { success: true, data: updated, message: '更新成功' }
  },

  deleteRecord(id: string) {
    if (!store.salaryRecords.has(id)) return { success: false, message: '薪资记录不存在' }
    store.salaryRecords.delete(id)
    return { success: true, message: '删除成功' }
  },

  generateMonthlySalary(month: string) {
    const employees = Array.from(store.employees.values()).filter((e) => e.status === 'active')
    const now = new Date().toISOString()
    const records: SalaryRecord[] = []
    let skipped = 0

    for (const emp of employees) {
      const existing = Array.from(store.salaryRecords.values()).find(
        (r) => r.employeeId === emp.id && r.month === month
      )
      if (existing) {
        skipped++
        continue
      }

      const plan = Array.from(store.salaryPlans.values()).find(
        (p) => p.position === emp.position || emp.position.includes(p.position)
      )
      const baseSalary = plan?.baseSalary ?? 8000
      const performanceBonus = plan?.performanceBonus ?? 2000

      const approvedOvertimes = Array.from(store.overtimes.values()).filter(
        (o) => o.employeeId === emp.id && o.status === 'approved' && o.date.startsWith(month)
      )
      const overtimePay = approvedOvertimes.reduce((sum, o) => sum + o.hours * 50, 0)

      const approvedLeaves = Array.from(store.leaves.values()).filter(
        (l) => l.employeeId === emp.id && l.status === 'approved' && l.startDate.startsWith(month)
      )
      let leaveDeduction = 0
      for (const leave of approvedLeaves) {
        const start = new Date(leave.startDate)
        const end = new Date(leave.endDate)
        const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
        const dailySalary = baseSalary / 22
        leaveDeduction += dailySalary * diffDays
      }

      const total = baseSalary + performanceBonus + overtimePay - leaveDeduction

      const id = store.generateId()
      const record: SalaryRecord = {
        id,
        employeeId: emp.id,
        month,
        baseSalary,
        performanceBonus,
        overtimePay,
        leaveDeduction,
        total,
        createdAt: now,
      }
      store.salaryRecords.set(id, record)
      records.push(record)
    }

    const message = skipped > 0
      ? `已生成${month}月度工资${records.length}条，跳过${skipped}条已存在记录`
      : `已生成${month}月度工资${records.length}条`
    return { success: true, data: records, message }
  },
}
import { store, type Attendance, type Leave, type Overtime } from '../data/store.js'

export interface AttendanceQuery {
  employeeId?: string
  startDate?: string
  endDate?: string
  status?: string
  page?: number
  pageSize?: number
}

export interface CheckInDTO {
  employeeId: string
  date: string
}

export interface CheckOutDTO {
  employeeId: string
  date: string
}

export interface LeaveDTO {
  employeeId: string
  startDate: string
  endDate: string
  type: 'annual' | 'sick' | 'personal' | 'maternity'
  reason: string
}

export interface OvertimeDTO {
  employeeId: string
  date: string
  hours: number
  reason: string
}

function isLate(checkIn: string): boolean {
  const d = new Date(checkIn)
  return d.getHours() * 60 + d.getMinutes() > 9 * 60
}

function isEarly(checkOut: string): boolean {
  const d = new Date(checkOut)
  return d.getHours() * 60 + d.getMinutes() < 18 * 60
}

export const attendanceService = {
  list(query: AttendanceQuery = {}) {
    let list = Array.from(store.attendance.values())

    if (query.employeeId) {
      list = list.filter((a) => a.employeeId === query.employeeId)
    }

    if (query.startDate) {
      list = list.filter((a) => a.date >= query.startDate!)
    }

    if (query.endDate) {
      list = list.filter((a) => a.date <= query.endDate!)
    }

    if (query.status) {
      list = list.filter((a) => a.status === query.status)
    }

    list.sort((a, b) => b.date.localeCompare(a.date))

    const total = list.length
    const page = query.page || 1
    const pageSize = query.pageSize || 20
    const start = (page - 1) * pageSize
    const items = list.slice(start, start + pageSize)

    return { success: true, data: { list: items, total, page, pageSize } }
  },

  checkIn(dto: CheckInDTO) {
    const now = new Date().toISOString()
    const existing = Array.from(store.attendance.values()).find(
      (a) => a.employeeId === dto.employeeId && a.date === dto.date
    )

    if (existing) {
      existing.checkIn = now
      existing.status = isLate(now) ? 'late' : 'normal'
      store.attendance.set(existing.id, existing)
      return { success: true, data: existing, message: '签到成功' }
    }

    const id = store.generateId()
    const record: Attendance = {
      id,
      employeeId: dto.employeeId,
      date: dto.date,
      checkIn: now,
      checkOut: null,
      status: isLate(now) ? 'late' : 'normal',
      createdAt: now,
    }
    store.attendance.set(id, record)
    return { success: true, data: record, message: '签到成功' }
  },

  checkOut(dto: CheckOutDTO) {
    const now = new Date().toISOString()
    const existing = Array.from(store.attendance.values()).find(
      (a) => a.employeeId === dto.employeeId && a.date === dto.date
    )

    if (!existing) {
      return { success: false, message: '请先签到' }
    }

    existing.checkOut = now
    if (existing.status !== 'late') {
      existing.status = isEarly(now) ? 'early' : 'normal'
    }
    store.attendance.set(existing.id, existing)
    return { success: true, data: existing, message: '签退成功' }
  },

  delete(id: string) {
    if (!store.attendance.has(id)) {
      return { success: false, message: '考勤记录不存在' }
    }
    store.attendance.delete(id)
    return { success: true, message: '删除成功' }
  },

  listLeaves(query: { employeeId?: string; status?: string; page?: number; pageSize?: number } = {}) {
    let list = Array.from(store.leaves.values())

    if (query.employeeId) list = list.filter((l) => l.employeeId === query.employeeId)
    if (query.status) list = list.filter((l) => l.status === query.status)

    list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    const total = list.length
    const page = query.page || 1
    const pageSize = query.pageSize || 10
    const items = list.slice((page - 1) * pageSize, page * pageSize)

    return { success: true, data: { list: items, total, page, pageSize } }
  },

  applyLeave(dto: LeaveDTO) {
    const now = new Date().toISOString()
    const id = store.generateId()
    const leave: Leave = {
      id,
      employeeId: dto.employeeId,
      startDate: dto.startDate,
      endDate: dto.endDate,
      type: dto.type,
      reason: dto.reason,
      status: 'pending',
      createdAt: now,
    }
    store.leaves.set(id, leave)
    return { success: true, data: leave, message: '请假申请已提交' }
  },

  approveLeave(id: string, approve: boolean) {
    const leave = store.leaves.get(id)
    if (!leave) {
      return { success: false, message: '请假记录不存在' }
    }
    leave.status = approve ? 'approved' : 'rejected'
    return { success: true, data: leave, message: approve ? '已批准' : '已驳回' }
  },

  deleteLeave(id: string) {
    if (!store.leaves.has(id)) {
      return { success: false, message: '请假记录不存在' }
    }
    store.leaves.delete(id)
    return { success: true, message: '删除成功' }
  },

  listOvertimes(query: { employeeId?: string; status?: string; page?: number; pageSize?: number } = {}) {
    let list = Array.from(store.overtimes.values())

    if (query.employeeId) list = list.filter((o) => o.employeeId === query.employeeId)
    if (query.status) list = list.filter((o) => o.status === query.status)

    list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    const total = list.length
    const page = query.page || 1
    const pageSize = query.pageSize || 10
    const items = list.slice((page - 1) * pageSize, page * pageSize)

    return { success: true, data: { list: items, total, page, pageSize } }
  },

  applyOvertime(dto: OvertimeDTO) {
    const now = new Date().toISOString()
    const id = store.generateId()
    const overtime: Overtime = {
      id,
      employeeId: dto.employeeId,
      date: dto.date,
      hours: dto.hours,
      reason: dto.reason,
      status: 'pending',
      createdAt: now,
    }
    store.overtimes.set(id, overtime)
    return { success: true, data: overtime, message: '加班申请已提交' }
  },

  approveOvertime(id: string, approve: boolean) {
    const overtime = store.overtimes.get(id)
    if (!overtime) {
      return { success: false, message: '加班记录不存在' }
    }
    overtime.status = approve ? 'approved' : 'rejected'
    return { success: true, data: overtime, message: approve ? '已批准' : '已驳回' }
  },

  deleteOvertime(id: string) {
    if (!store.overtimes.has(id)) {
      return { success: false, message: '加班记录不存在' }
    }
    store.overtimes.delete(id)
    return { success: true, message: '删除成功' }
  },
}
import { store } from '../data/store.js'

export const statisticsService = {
  getOverview() {
    const totalEmployees = store.employees.size
    const activeEmployees = Array.from(store.employees.values()).filter((e) => e.status === 'active').length
    const totalDepartments = store.departments.size

    const today = new Date().toISOString().substring(0, 10)
    const todayAttendance = Array.from(store.attendance.values()).filter((a) => a.date === today).length

    const currentMonth = today.substring(0, 7)
    const monthSalaryRecords = Array.from(store.salaryRecords.values()).filter(
      (r) => r.month === currentMonth
    )
    const totalSalary = monthSalaryRecords.reduce((sum, r) => sum + r.total, 0)

    const pendingLeaves = Array.from(store.leaves.values()).filter((l) => l.status === 'pending').length

    return {
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        totalDepartments,
        todayAttendance,
        totalSalary,
        pendingLeaves,
      },
    }
  },

  getDepartmentStats() {
    const departments = Array.from(store.departments.values())
    const stats = departments.map((dept) => {
      const employees = Array.from(store.employees.values()).filter(
        (e) => e.departmentId === dept.id && e.status === 'active'
      )
      return {
        departmentId: dept.id,
        departmentName: dept.name,
        employeeCount: employees.length,
      }
    })
    return { success: true, data: stats }
  },

  getAttendanceStats(startDate?: string, endDate?: string) {
    let records = Array.from(store.attendance.values())

    if (startDate) records = records.filter((r) => r.date >= startDate!)
    if (endDate) records = records.filter((r) => r.date <= endDate!)

    const normalDays = records.filter((r) => r.status === 'normal').length
    const lateDays = records.filter((r) => r.status === 'late').length
    const earlyDays = records.filter((r) => r.status === 'early').length
    const absentDays = records.filter((r) => r.status === 'absent').length
    const totalDays = records.length

    const attendanceRate = totalDays > 0
      ? Number(((normalDays / totalDays) * 100).toFixed(1))
      : 0

    return {
      success: true,
      data: {
        totalDays,
        normalDays,
        lateDays,
        earlyDays,
        absentDays,
        attendanceRate,
      },
    }
  },

  getSalaryStats(month?: string) {
    let records = Array.from(store.salaryRecords.values())
    if (month) {
      records = records.filter((r) => r.month === month)
    }

    const totalAmount = records.reduce((sum, r) => sum + r.total, 0)
    const baseTotal = records.reduce((sum, r) => sum + r.baseSalary, 0)
    const bonusTotal = records.reduce((sum, r) => sum + r.performanceBonus, 0)
    const overtimeTotal = records.reduce((sum, r) => sum + r.overtimePay, 0)
    const deductionTotal = records.reduce((sum, r) => sum + r.leaveDeduction, 0)
    const employeeCount = records.length

    return {
      success: true,
      data: {
        totalAmount,
        baseTotal,
        bonusTotal,
        overtimeTotal,
        deductionTotal,
        employeeCount,
      },
    }
  },

  getPositionDistribution() {
    const positions = Array.from(store.employees.values())
      .filter((e) => e.status === 'active')
      .map((e) => e.position)

    const distribution: Record<string, number> = {}
    for (const pos of positions) {
      distribution[pos] = (distribution[pos] || 0) + 1
    }

    const data = Object.entries(distribution).map(([position, count]) => ({ position, count }))
    return { success: true, data }
  },

  getGenderDistribution() {
    const employees = Array.from(store.employees.values()).filter((e) => e.status === 'active')
    const maleCount = employees.filter((e) => e.gender === 'male').length
    const femaleCount = employees.filter((e) => e.gender === 'female').length

    const data = [
      { gender: 'male', count: maleCount },
      { gender: 'female', count: femaleCount },
    ]
    return { success: true, data }
  },

  getLeaveStats(status?: string) {
    let leaves = Array.from(store.leaves.values())
    if (status) leaves = leaves.filter((l) => l.status === status)

    const byType: Record<string, number> = {}
    for (const leave of leaves) {
      byType[leave.type] = (byType[leave.type] || 0) + 1
    }

    return {
      success: true,
      data: { total: leaves.length, byType },
    }
  },

  getMonthlyTrend(months: number = 6) {
    const result: { month: string; employees: number; attendance: number }[] = []
    const now = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

      const salaryRecords = Array.from(store.salaryRecords.values()).filter(
        (r) => r.month === monthStr
      )
      const employees = salaryRecords.length

      const attendanceCount = Array.from(store.attendance.values()).filter(
        (a) => a.date.startsWith(monthStr)
      ).length

      result.push({ month: monthStr, employees, attendance: attendanceCount })
    }

    return { success: true, data: result }
  },
}

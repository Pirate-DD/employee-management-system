import bcrypt from 'bcryptjs'

export interface User {
  id: string
  username: string
  password: string
  role: 'admin' | 'employee'
  createdAt: string
  updatedAt: string
}

export interface Employee {
  id: string
  userId: string
  name: string
  gender: 'male' | 'female'
  departmentId: string
  position: string
  phone: string
  email: string
  hireDate: string
  status: 'active' | 'on-leave' | 'resigned'
  createdAt: string
  updatedAt: string
}

export interface Department {
  id: string
  name: string
  parentId: string | null
  managerId: string | null
  description: string
  createdAt: string
}

export interface Attendance {
  id: string
  employeeId: string
  date: string
  checkIn: string | null
  checkOut: string | null
  status: 'normal' | 'late' | 'early' | 'absent'
  createdAt: string
}

export interface Leave {
  id: string
  employeeId: string
  startDate: string
  endDate: string
  type: 'annual' | 'sick' | 'personal' | 'maternity'
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export interface Overtime {
  id: string
  employeeId: string
  date: string
  hours: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export interface SalaryPlan {
  id: string
  name: string
  position: string
  baseSalary: number
  performanceBonus: number
  createdAt: string
}

export interface SalaryRecord {
  id: string
  employeeId: string
  month: string
  baseSalary: number
  performanceBonus: number
  overtimePay: number
  leaveDeduction: number
  total: number
  createdAt: string
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

export class DataStore {
  public users: Map<string, User> = new Map()
  public employees: Map<string, Employee> = new Map()
  public departments: Map<string, Department> = new Map()
  public attendance: Map<string, Attendance> = new Map()
  public leaves: Map<string, Leave> = new Map()
  public overtimes: Map<string, Overtime> = new Map()
  public salaryPlans: Map<string, SalaryPlan> = new Map()
  public salaryRecords: Map<string, SalaryRecord> = new Map()

  private static instance: DataStore | null = null

  static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore()
      DataStore.instance.initialize()
    }
    return DataStore.instance
  }

  private initialize(): void {
    const now = new Date().toISOString()

    const adminUserId = generateId()
    const adminPassword = bcrypt.hashSync('admin123', 10)
    this.users.set(adminUserId, {
      id: adminUserId,
      username: 'admin',
      password: adminPassword,
      role: 'admin',
      createdAt: now,
      updatedAt: now,
    })

    const hrDeptId = generateId()
    const techDeptId = generateId()
    const financeDeptId = generateId()
    this.departments.set(hrDeptId, {
      id: hrDeptId, name: '人力资源部', parentId: null, managerId: null,
      description: '负责公司人力资源管理', createdAt: now,
    })
    this.departments.set(techDeptId, {
      id: techDeptId, name: '技术研发部', parentId: null, managerId: null,
      description: '负责产品技术研发', createdAt: now,
    })
    this.departments.set(financeDeptId, {
      id: financeDeptId, name: '财务部', parentId: null, managerId: null,
      description: '负责公司财务管理', createdAt: now,
    })

    const positions = ['前端工程师', '后端工程师', '产品经理', 'UI设计师', '测试工程师', '运维工程师']
    for (let i = 0; i < 6; i++) {
      const userId = generateId()
      const password = bcrypt.hashSync('123456', 10)
      this.users.set(userId, {
        id: userId,
        username: `employee${i + 1}`,
        password,
        role: 'employee',
        createdAt: now,
        updatedAt: now,
      })

      const deptId = i < 3 ? techDeptId : (i < 5 ? hrDeptId : financeDeptId)
      const empId = generateId()
      this.employees.set(empId, {
        id: empId,
        userId,
        name: `员工${i + 1}`,
        gender: i % 2 === 0 ? 'male' : 'female',
        departmentId: deptId,
        position: positions[i],
        phone: `1380000000${i + 1}`,
        email: `employee${i + 1}@company.com`,
        hireDate: '2024-01-15',
        status: 'active',
        createdAt: now,
        updatedAt: now,
      })
    }

    const planIds: string[] = []
    const planNames = ['初级工程师方案', '中级工程师方案', '高级工程师方案', '产品经理方案']
    const planPositions = ['工程师', '工程师', '工程师', '经理']
    const baseSalaries = [8000, 12000, 18000, 15000]
    const bonuses = [2000, 4000, 6000, 5000]
    for (let i = 0; i < 4; i++) {
      const planId = generateId()
      planIds.push(planId)
      this.salaryPlans.set(planId, {
        id: planId,
        name: planNames[i],
        position: planPositions[i],
        baseSalary: baseSalaries[i],
        performanceBonus: bonuses[i],
        createdAt: now,
      })
    }

    const empIds = Array.from(this.employees.keys())
    const currentMonth = new Date().toISOString().substring(0, 7)
    for (const empId of empIds) {
      const emp = this.employees.get(empId)!
      let base = 8000
      let bonus = 2000
      if (emp.position.includes('高级')) { base = 18000; bonus = 6000 }
      else if (emp.position.includes('中级')) { base = 12000; bonus = 4000 }
      else if (emp.position.includes('经理') || emp.position.includes('产品')) { base = 15000; bonus = 5000 }
      else if (emp.position.includes('设计') || emp.position.includes('测试') || emp.position.includes('运维')) { base = 10000; bonus = 3000 }

      const recordId = generateId()
      this.salaryRecords.set(recordId, {
        id: recordId,
        employeeId: empId,
        month: currentMonth,
        baseSalary: base,
        performanceBonus: bonus,
        overtimePay: 0,
        leaveDeduction: 0,
        total: base + bonus,
        createdAt: now,
      })
    }

    const today = new Date()
    for (const empId of empIds) {
      for (let d = 0; d < 10; d++) {
        const date = new Date(today)
        date.setDate(date.getDate() - d)
        const dateStr = date.toISOString().substring(0, 10)
        const dayOfWeek = date.getDay()
        if (dayOfWeek === 0 || dayOfWeek === 6) continue

        const attId = generateId()
        this.attendance.set(attId, {
          id: attId,
          employeeId: empId,
          date: dateStr,
          checkIn: `${dateStr}T09:00:00.000Z`,
          checkOut: `${dateStr}T18:00:00.000Z`,
          status: 'normal',
          createdAt: now,
        })
      }
    }
  }

  generateId(): string {
    return generateId()
  }
}

export const store = DataStore.getInstance()
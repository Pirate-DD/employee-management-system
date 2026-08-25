export type UserRole = 'admin' | 'employee'

export interface User {
  id: string
  username: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
}

export interface AuthResponse {
  success: boolean
  message?: string
  data?: {
    token: string
    user: User
  }
}

export type Gender = 'male' | 'female'
export type EmployeeStatus = 'active' | 'on-leave' | 'resigned'

export interface Employee {
  id: string
  userId: string
  name: string
  gender: Gender
  departmentId: string
  position: string
  phone: string
  email: string
  hireDate: string
  status: EmployeeStatus
  createdAt: string
  updatedAt: string
}

export interface CreateEmployeeDTO {
  name: string
  gender: Gender
  departmentId: string
  position: string
  phone: string
  email: string
  hireDate: string
  status?: EmployeeStatus
}

export interface UpdateEmployeeDTO {
  name?: string
  gender?: Gender
  departmentId?: string
  position?: string
  phone?: string
  email?: string
  hireDate?: string
  status?: EmployeeStatus
}

export interface EmployeeListParams {
  keyword?: string
  departmentId?: string
  status?: EmployeeStatus
  page?: number
  pageSize?: number
}

export type DepartmentStatus = 'active' | 'inactive'

export interface Department {
  id: string
  name: string
  parentId: string | null
  managerId: string | null
  description: string
  createdAt: string
  children?: Department[]
}

export interface CreateDepartmentDTO {
  name: string
  parentId?: string | null
  description?: string
}

export interface UpdateDepartmentDTO {
  name?: string
  parentId?: string | null
  description?: string
}

export type AttendanceStatus = 'normal' | 'late' | 'early' | 'absent'

export interface Attendance {
  id: string
  employeeId: string
  date: string
  checkIn: string | null
  checkOut: string | null
  status: AttendanceStatus
  createdAt: string
}

export interface CheckInDTO {
  employeeId: string
  date: string
}

export interface CheckOutDTO {
  employeeId: string
  date: string
}

export interface AttendanceListParams {
  employeeId?: string
  startDate?: string
  endDate?: string
  status?: AttendanceStatus
  page?: number
  pageSize?: number
}

export type LeaveType = 'annual' | 'sick' | 'personal' | 'maternity'
export type LeaveStatus = 'pending' | 'approved' | 'rejected'

export interface Leave {
  id: string
  employeeId: string
  startDate: string
  endDate: string
  type: LeaveType
  reason: string
  status: LeaveStatus
  createdAt: string
}

export interface LeaveDTO {
  employeeId: string
  startDate: string
  endDate: string
  type: LeaveType
  reason: string
}

export type OvertimeStatus = 'pending' | 'approved' | 'rejected'

export interface Overtime {
  id: string
  employeeId: string
  date: string
  hours: number
  reason: string
  status: OvertimeStatus
  createdAt: string
}

export interface OvertimeDTO {
  employeeId: string
  date: string
  hours: number
  reason: string
}

export type SalaryStatus = 'active' | 'inactive'

export interface SalaryPlan {
  id: string
  name: string
  position: string
  baseSalary: number
  performanceBonus: number
  createdAt: string
}

export interface CreateSalaryPlanDTO {
  name: string
  position: string
  baseSalary: number
  performanceBonus?: number
}

export interface UpdateSalaryPlanDTO {
  name?: string
  position?: string
  baseSalary?: number
  performanceBonus?: number
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

export interface CreateSalaryRecordDTO {
  employeeId: string
  month: string
  baseSalary: number
  performanceBonus?: number
  overtimePay?: number
  leaveDeduction?: number
}

export interface UpdateSalaryRecordDTO {
  baseSalary?: number
  performanceBonus?: number
  overtimePay?: number
  leaveDeduction?: number
  total?: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
}

export interface PaginatedResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface OverviewStats {
  totalEmployees: number
  activeEmployees: number
  totalDepartments: number
  todayAttendance: number
  totalSalary: number
  pendingLeaves: number
}

export interface DepartmentStats {
  departmentId: string
  departmentName: string
  employeeCount: number
}

export interface AttendanceStats {
  totalDays: number
  normalDays: number
  lateDays: number
  earlyDays: number
  absentDays: number
  attendanceRate: number
}

export interface SalaryStats {
  totalAmount: number
  baseTotal: number
  bonusTotal: number
  overtimeTotal: number
  deductionTotal: number
  employeeCount: number
}

export interface PositionDistribution {
  position: string
  count: number
}

export interface GenderDistribution {
  gender: string
  count: number
}

export interface MonthlyTrend {
  month: string
  employees: number
  attendance: number
}

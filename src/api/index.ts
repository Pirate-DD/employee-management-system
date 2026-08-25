import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import type {
  ApiResponse,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  Employee,
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
  EmployeeListParams,
  Department,
  CreateDepartmentDTO,
  UpdateDepartmentDTO,
  Attendance,
  CheckInDTO,
  CheckOutDTO,
  AttendanceListParams,
  Leave,
  LeaveDTO,
  Overtime,
  OvertimeDTO,
  SalaryPlan,
  CreateSalaryPlanDTO,
  UpdateSalaryPlanDTO,
  SalaryRecord,
  CreateSalaryRecordDTO,
  UpdateSalaryRecordDTO,
  OverviewStats,
  DepartmentStats,
  AttendanceStats,
  SalaryStats,
  PositionDistribution,
  GenderDistribution,
  MonthlyTrend,
  PaginatedResult,
} from '@/types'

const request: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

request.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      const { status } = error.response
      if (status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

async function requestApi<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
  return request(config) as unknown as Promise<ApiResponse<T>>
}

export const authApi = {
  login: (data: LoginRequest) =>
    requestApi<AuthResponse['data']>({ method: 'post', url: '/auth/login', data }),
  register: (data: RegisterRequest) =>
    requestApi<AuthResponse['data']>({ method: 'post', url: '/auth/register', data }),
  logout: () => requestApi<null>({ method: 'post', url: '/auth/logout' }),
  getProfile: () => requestApi<User>({ method: 'get', url: '/auth/profile' }),
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    requestApi<AuthResponse['data']>({ method: 'put', url: '/auth/password', data }),
}

export const employeeApi = {
  list: (params?: EmployeeListParams) =>
    requestApi<PaginatedResult<Employee>>({ method: 'get', url: '/employees', params }),
  getById: (id: string) => requestApi<Employee>({ method: 'get', url: `/employees/${id}` }),
  create: (data: CreateEmployeeDTO) =>
    requestApi<Employee>({ method: 'post', url: '/employees', data }),
  update: (id: string, data: UpdateEmployeeDTO) =>
    requestApi<Employee>({ method: 'put', url: `/employees/${id}`, data }),
  delete: (id: string) => requestApi<null>({ method: 'delete', url: `/employees/${id}` }),
}

export const departmentApi = {
  list: () => requestApi<Department[]>({ method: 'get', url: '/departments' }),
  getTree: () => requestApi<Department[]>({ method: 'get', url: '/departments/tree' }),
  getById: (id: string) => requestApi<Department>({ method: 'get', url: `/departments/${id}` }),
  create: (data: CreateDepartmentDTO) =>
    requestApi<Department>({ method: 'post', url: '/departments', data }),
  update: (id: string, data: UpdateDepartmentDTO) =>
    requestApi<Department>({ method: 'put', url: `/departments/${id}`, data }),
  delete: (id: string) => requestApi<null>({ method: 'delete', url: `/departments/${id}` }),
}

export const attendanceApi = {
  list: (params?: AttendanceListParams) =>
    requestApi<PaginatedResult<Attendance>>({ method: 'get', url: '/attendance', params }),
  checkIn: (data: CheckInDTO) =>
    requestApi<Attendance>({ method: 'post', url: '/attendance/check-in', data }),
  checkOut: (data: CheckOutDTO) =>
    requestApi<Attendance>({ method: 'post', url: '/attendance/check-out', data }),
  delete: (id: string) => requestApi<null>({ method: 'delete', url: `/attendance/${id}` }),

  listLeaves: (params?: { employeeId?: string; status?: string; page?: number; pageSize?: number }) =>
    requestApi<PaginatedResult<Leave>>({ method: 'get', url: '/attendance/leaves', params }),
  applyLeave: (data: LeaveDTO) =>
    requestApi<Leave>({ method: 'post', url: '/attendance/leaves', data }),
  approveLeave: (id: string, approve: boolean) =>
    requestApi<Leave>({ method: 'put', url: `/attendance/leaves/${id}/approve`, data: { approve } }),
  deleteLeave: (id: string) => requestApi<null>({ method: 'delete', url: `/attendance/leaves/${id}` }),

  listOvertimes: (params?: { employeeId?: string; status?: string; page?: number; pageSize?: number }) =>
    requestApi<PaginatedResult<Overtime>>({ method: 'get', url: '/attendance/overtimes', params }),
  applyOvertime: (data: OvertimeDTO) =>
    requestApi<Overtime>({ method: 'post', url: '/attendance/overtimes', data }),
  approveOvertime: (id: string, approve: boolean) =>
    requestApi<Overtime>({ method: 'put', url: `/attendance/overtimes/${id}/approve`, data: { approve } }),
  deleteOvertime: (id: string) => requestApi<null>({ method: 'delete', url: `/attendance/overtimes/${id}` }),
}

export const salaryApi = {
  listPlans: () => requestApi<SalaryPlan[]>({ method: 'get', url: '/salary/plans' }),
  getPlanById: (id: string) => requestApi<SalaryPlan>({ method: 'get', url: `/salary/plans/${id}` }),
  createPlan: (data: CreateSalaryPlanDTO) =>
    requestApi<SalaryPlan>({ method: 'post', url: '/salary/plans', data }),
  updatePlan: (id: string, data: UpdateSalaryPlanDTO) =>
    requestApi<SalaryPlan>({ method: 'put', url: `/salary/plans/${id}`, data }),
  deletePlan: (id: string) => requestApi<null>({ method: 'delete', url: `/salary/plans/${id}` }),

  listRecords: (params?: { employeeId?: string; month?: string; page?: number; pageSize?: number }) =>
    requestApi<PaginatedResult<SalaryRecord>>({ method: 'get', url: '/salary/records', params }),
  getRecordById: (id: string) => requestApi<SalaryRecord>({ method: 'get', url: `/salary/records/${id}` }),
  createRecord: (data: CreateSalaryRecordDTO) =>
    requestApi<SalaryRecord>({ method: 'post', url: '/salary/records', data }),
  updateRecord: (id: string, data: UpdateSalaryRecordDTO) =>
    requestApi<SalaryRecord>({ method: 'put', url: `/salary/records/${id}`, data }),
  deleteRecord: (id: string) => requestApi<null>({ method: 'delete', url: `/salary/records/${id}` }),

  generateMonthly: (month: string) =>
    requestApi<null>({ method: 'post', url: `/salary/generate/${month}` }),
}

export const statisticsApi = {
  getOverview: () => requestApi<OverviewStats>({ method: 'get', url: '/statistics/overview' }),
  getDepartmentStats: () =>
    requestApi<DepartmentStats[]>({ method: 'get', url: '/statistics/departments' }),
  getAttendanceStats: (startDate?: string, endDate?: string) =>
    requestApi<AttendanceStats>({
      method: 'get',
      url: '/statistics/attendance',
      params: { startDate, endDate },
    }),
  getSalaryStats: (month?: string) =>
    requestApi<SalaryStats>({ method: 'get', url: '/statistics/salary', params: { month } }),
  getPositionDistribution: () =>
    requestApi<PositionDistribution[]>({ method: 'get', url: '/statistics/positions' }),
  getGenderDistribution: () =>
    requestApi<GenderDistribution[]>({ method: 'get', url: '/statistics/gender' }),
  getLeaveStats: (status?: string) =>
    requestApi<{ total: number; approved: number; rejected: number; pending: number }>({
      method: 'get',
      url: '/statistics/leaves',
      params: { status },
    }),
  getMonthlyTrend: (months: number = 6) =>
    requestApi<MonthlyTrend[]>({ method: 'get', url: '/statistics/trend', params: { months } }),
}

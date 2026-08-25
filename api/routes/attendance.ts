import { Router, type Response } from 'express'
import { authenticateToken, requireRole, type AuthRequest } from '../middleware/auth.js'
import { attendanceService, type CheckInDTO, type CheckOutDTO, type LeaveDTO, type OvertimeDTO } from '../services/attendanceService.js'

const router = Router()

router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
  const { employeeId, startDate, endDate, status, page, pageSize } = req.query
  const result = attendanceService.list({
    employeeId: employeeId as string,
    startDate: startDate as string,
    endDate: endDate as string,
    status: status as string,
    page: page ? parseInt(page as string) : undefined,
    pageSize: pageSize ? parseInt(pageSize as string) : undefined,
  })
  res.json(result)
})

router.post('/check-in', authenticateToken, (req: AuthRequest, res: Response) => {
  const dto = req.body as CheckInDTO
  if (!dto.employeeId || !dto.date) {
    res.status(400).json({ success: false, message: '缺少员工ID或日期' })
    return
  }
  const result = attendanceService.checkIn(dto)
  res.json(result)
})

router.post('/check-out', authenticateToken, (req: AuthRequest, res: Response) => {
  const dto = req.body as CheckOutDTO
  if (!dto.employeeId || !dto.date) {
    res.status(400).json({ success: false, message: '缺少员工ID或日期' })
    return
  }
  const result = attendanceService.checkOut(dto)
  if (!result.success) {
    res.status(400).json(result)
    return
  }
  res.json(result)
})

router.delete('/:id', authenticateToken, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const result = attendanceService.delete(req.params.id)
  if (!result.success) {
    res.status(404).json(result)
    return
  }
  res.json(result)
})

router.get('/leaves', authenticateToken, (req: AuthRequest, res: Response) => {
  const { employeeId, status, page, pageSize } = req.query
  const result = attendanceService.listLeaves({
    employeeId: employeeId as string,
    status: status as string,
    page: page ? parseInt(page as string) : undefined,
    pageSize: pageSize ? parseInt(pageSize as string) : undefined,
  })
  res.json(result)
})

router.post('/leaves', authenticateToken, (req: AuthRequest, res: Response) => {
  const dto = req.body as LeaveDTO
  if (!dto.employeeId || !dto.startDate || !dto.endDate || !dto.type) {
    res.status(400).json({ success: false, message: '缺少必填字段' })
    return
  }
  const result = attendanceService.applyLeave(dto)
  res.status(201).json(result)
})

router.put('/leaves/:id/approve', authenticateToken, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const approve = req.body.approve !== false
  const result = attendanceService.approveLeave(req.params.id, approve)
  if (!result.success) {
    res.status(404).json(result)
    return
  }
  res.json(result)
})

router.delete('/leaves/:id', authenticateToken, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const result = attendanceService.deleteLeave(req.params.id)
  if (!result.success) {
    res.status(404).json(result)
    return
  }
  res.json(result)
})

router.get('/overtimes', authenticateToken, (req: AuthRequest, res: Response) => {
  const { employeeId, status, page, pageSize } = req.query
  const result = attendanceService.listOvertimes({
    employeeId: employeeId as string,
    status: status as string,
    page: page ? parseInt(page as string) : undefined,
    pageSize: pageSize ? parseInt(pageSize as string) : undefined,
  })
  res.json(result)
})

router.post('/overtimes', authenticateToken, (req: AuthRequest, res: Response) => {
  const dto = req.body as OvertimeDTO
  if (!dto.employeeId || !dto.date || !dto.hours) {
    res.status(400).json({ success: false, message: '缺少必填字段' })
    return
  }
  const result = attendanceService.applyOvertime(dto)
  res.status(201).json(result)
})

router.put('/overtimes/:id/approve', authenticateToken, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const approve = req.body.approve !== false
  const result = attendanceService.approveOvertime(req.params.id, approve)
  if (!result.success) {
    res.status(404).json(result)
    return
  }
  res.json(result)
})

router.delete('/overtimes/:id', authenticateToken, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const result = attendanceService.deleteOvertime(req.params.id)
  if (!result.success) {
    res.status(404).json(result)
    return
  }
  res.json(result)
})

export default router
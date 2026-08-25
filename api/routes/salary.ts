import { Router, type Response } from 'express'
import { authenticateToken, requireRole, type AuthRequest } from '../middleware/auth.js'
import { salaryService, type CreatePlanDTO, type UpdatePlanDTO, type CreateRecordDTO, type UpdateRecordDTO } from '../services/salaryService.js'

const router = Router()

router.get('/plans', authenticateToken, (req: AuthRequest, res: Response) => {
  const result = salaryService.listPlans()
  res.json(result)
})

router.get('/plans/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const result = salaryService.getPlanById(req.params.id)
  if (!result.success) {
    res.status(404).json(result)
    return
  }
  res.json(result)
})

router.post('/plans', authenticateToken, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const dto = req.body as CreatePlanDTO
  if (!dto.name || !dto.baseSalary) {
    res.status(400).json({ success: false, message: '缺少必填字段' })
    return
  }
  const result = salaryService.createPlan(dto)
  res.status(201).json(result)
})

router.put('/plans/:id', authenticateToken, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const dto = req.body as UpdatePlanDTO
  const result = salaryService.updatePlan(req.params.id, dto)
  if (!result.success) {
    res.status(404).json(result)
    return
  }
  res.json(result)
})

router.delete('/plans/:id', authenticateToken, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const result = salaryService.deletePlan(req.params.id)
  if (!result.success) {
    res.status(404).json(result)
    return
  }
  res.json(result)
})

router.get('/records', authenticateToken, (req: AuthRequest, res: Response) => {
  const { employeeId, month, page, pageSize } = req.query
  const result = salaryService.listRecords({
    employeeId: employeeId as string,
    month: month as string,
    page: page ? parseInt(page as string) : undefined,
    pageSize: pageSize ? parseInt(pageSize as string) : undefined,
  })
  res.json(result)
})

router.get('/records/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const result = salaryService.getRecordById(req.params.id)
  if (!result.success) {
    res.status(404).json(result)
    return
  }
  res.json(result)
})

router.post('/records', authenticateToken, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const dto = req.body as CreateRecordDTO
  if (!dto.employeeId || !dto.month) {
    res.status(400).json({ success: false, message: '缺少必填字段' })
    return
  }
  const result = salaryService.createRecord(dto)
  res.status(201).json(result)
})

router.put('/records/:id', authenticateToken, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const dto = req.body as UpdateRecordDTO
  const result = salaryService.updateRecord(req.params.id, dto)
  if (!result.success) {
    res.status(404).json(result)
    return
  }
  res.json(result)
})

router.delete('/records/:id', authenticateToken, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const result = salaryService.deleteRecord(req.params.id)
  if (!result.success) {
    res.status(404).json(result)
    return
  }
  res.json(result)
})

router.post('/generate/:month', authenticateToken, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const result = salaryService.generateMonthlySalary(req.params.month)
  res.json(result)
})

export default router
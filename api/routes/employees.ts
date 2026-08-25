import { Router, type Response } from 'express'
import { authenticateToken, requireRole, type AuthRequest } from '../middleware/auth.js'
import { employeeService, type CreateEmployeeDTO, type UpdateEmployeeDTO } from '../services/employeeService.js'

const router = Router()

router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
  const { keyword, departmentId, status, page, pageSize } = req.query
  const result = employeeService.list({
    keyword: keyword as string,
    departmentId: departmentId as string,
    status: status as string,
    page: page ? parseInt(page as string) : undefined,
    pageSize: pageSize ? parseInt(pageSize as string) : undefined,
  })
  res.json(result)
})

router.get('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const result = employeeService.getById(req.params.id)
  if (!result.success) {
    res.status(404).json(result)
    return
  }
  res.json(result)
})

router.post('/', authenticateToken, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const dto = req.body as CreateEmployeeDTO
  if (!dto.name || !dto.departmentId || !dto.position) {
    res.status(400).json({ success: false, message: '缺少必填字段' })
    return
  }
  const result = employeeService.create(dto)
  res.status(201).json(result)
})

router.put('/:id', authenticateToken, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const dto = req.body as UpdateEmployeeDTO
  const result = employeeService.update(req.params.id, dto)
  if (!result.success) {
    res.status(404).json(result)
    return
  }
  res.json(result)
})

router.delete('/:id', authenticateToken, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const result = employeeService.delete(req.params.id)
  if (!result.success) {
    res.status(404).json(result)
    return
  }
  res.json(result)
})

export default router
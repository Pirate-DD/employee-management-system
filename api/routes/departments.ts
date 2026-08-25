import { Router, type Response } from 'express'
import { authenticateToken, requireRole, type AuthRequest } from '../middleware/auth.js'
import { departmentService, type CreateDepartmentDTO, type UpdateDepartmentDTO } from '../services/departmentService.js'

const router = Router()

router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
  const result = departmentService.list()
  res.json(result)
})

router.get('/tree', authenticateToken, (req: AuthRequest, res: Response) => {
  const result = departmentService.getTree()
  res.json(result)
})

router.get('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const result = departmentService.getById(req.params.id)
  if (!result.success) {
    res.status(404).json(result)
    return
  }
  res.json(result)
})

router.post('/', authenticateToken, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const dto = req.body as CreateDepartmentDTO
  if (!dto.name) {
    res.status(400).json({ success: false, message: '部门名称不能为空' })
    return
  }
  const result = departmentService.create(dto)
  res.status(201).json(result)
})

router.put('/:id', authenticateToken, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const dto = req.body as UpdateDepartmentDTO
  const result = departmentService.update(req.params.id, dto)
  if (!result.success) {
    res.status(400).json(result)
    return
  }
  res.json(result)
})

router.delete('/:id', authenticateToken, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const result = departmentService.delete(req.params.id)
  if (!result.success) {
    res.status(400).json(result)
    return
  }
  res.json(result)
})

export default router
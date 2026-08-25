import { Router, type Request, type Response } from 'express'
import { authService } from '../services/authService.js'
import { authenticateToken, type AuthRequest } from '../middleware/auth.js'

const router = Router()

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body
  if (!username || !password) {
    res.status(400).json({ success: false, message: '用户名和密码不能为空' })
    return
  }
  const result = authService.register({ username, password })
  if (!result.success) {
    res.status(400).json(result)
    return
  }
  res.status(201).json(result)
})

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body
  if (!username || !password) {
    res.status(400).json({ success: false, message: '用户名和密码不能为空' })
    return
  }
  const result = authService.login({ username, password })
  if (!result.success) {
    res.status(401).json(result)
    return
  }
  res.json(result)
})

router.post('/logout', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({ success: true, message: '登出成功' })
})

router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: '请先登录' })
    return
  }
  const user = authService.getUserById(req.user.id)
  if (!user) {
    res.status(404).json({ success: false, message: '用户不存在' })
    return
  }
  res.json({ success: true, data: user })
})

router.put('/password', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: '请先登录' })
    return
  }
  const { oldPassword, newPassword } = req.body
  if (!oldPassword || !newPassword) {
    res.status(400).json({ success: false, message: '请填写原密码和新密码' })
    return
  }
  if (newPassword.length < 6) {
    res.status(400).json({ success: false, message: '新密码至少6位' })
    return
  }
  const result = authService.changePassword(req.user.id, oldPassword, newPassword)
  if (!result.success) {
    res.status(400).json(result)
    return
  }
  res.json(result)
})

export default router
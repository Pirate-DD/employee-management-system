import { type Request, type Response, type NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { store } from '../data/store.js'

const JWT_SECRET = process.env.JWT_SECRET || 'employee-management-system-secret-key'

export interface AuthRequest extends Request {
  user?: {
    id: string
    username: string
    role: string
  }
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    res.status(401).json({ success: false, message: '未提供认证令牌' })
    return
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string; role: string }
    const user = store.users.get(decoded.userId)

    if (!user) {
      res.status(401).json({ success: false, message: '用户不存在' })
      return
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    }
    next()
  } catch {
    res.status(403).json({ success: false, message: '令牌无效或已过期' })
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: '请先登录' })
      return
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: '权限不足' })
      return
    }
    next()
  }
}

export { JWT_SECRET }
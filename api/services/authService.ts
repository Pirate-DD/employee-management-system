import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { store, type User } from '../data/store.js'
import { JWT_SECRET } from '../middleware/auth.js'

export interface LoginDTO {
  username: string
  password: string
}

export interface RegisterDTO {
  username: string
  password: string
}

export interface AuthResult {
  success: boolean
  message: string
  data?: {
    token: string
    user: Omit<User, 'password'>
  }
}

function generateToken(user: User): string {
  return jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
}

function sanitizeUser(user: User): Omit<User, 'password'> {
  const { password: _, ...rest } = user
  return rest
}

export const authService = {
  login(dto: LoginDTO): AuthResult {
    const user = Array.from(store.users.values()).find(
      (u) => u.username === dto.username
    )

    if (!user) {
      return { success: false, message: '用户名或密码错误' }
    }

    const valid = bcrypt.compareSync(dto.password, user.password)
    if (!valid) {
      return { success: false, message: '用户名或密码错误' }
    }

    const token = generateToken(user)
    return {
      success: true,
      message: '登录成功',
      data: { token, user: sanitizeUser(user) },
    }
  },

  register(dto: RegisterDTO): AuthResult {
    const existing = Array.from(store.users.values()).find(
      (u) => u.username === dto.username
    )

    if (existing) {
      return { success: false, message: '用户名已存在' }
    }

    const hashedPassword = bcrypt.hashSync(dto.password, 10)
    const now = new Date().toISOString()
    const id = store.generateId()

    const newUser: User = {
      id,
      username: dto.username,
      password: hashedPassword,
      role: 'employee',
      createdAt: now,
      updatedAt: now,
    }

    store.users.set(id, newUser)

    const token = generateToken(newUser)
    return {
      success: true,
      message: '注册成功',
      data: { token, user: sanitizeUser(newUser) },
    }
  },

  logout(): AuthResult {
    return { success: true, message: '登出成功' }
  },

  getUserById(id: string): Omit<User, 'password'> | null {
    const user = store.users.get(id)
    if (!user) return null
    return sanitizeUser(user)
  },

  verifyToken(token: string): { valid: boolean; userId?: string; role?: string } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
      return { valid: true, userId: decoded.userId, role: decoded.role }
    } catch {
      return { valid: false }
    }
  },

  changePassword(userId: string, oldPassword: string, newPassword: string): AuthResult {
    const user = store.users.get(userId)
    if (!user) {
      return { success: false, message: '用户不存在' }
    }

    const valid = bcrypt.compareSync(oldPassword, user.password)
    if (!valid) {
      return { success: false, message: '原密码错误' }
    }

    user.password = bcrypt.hashSync(newPassword, 10)
    user.updatedAt = new Date().toISOString()
    store.users.set(user.id, user)

    const token = generateToken(user)
    return {
      success: true,
      message: '密码修改成功',
      data: { token, user: sanitizeUser(user) },
    }
  },
}